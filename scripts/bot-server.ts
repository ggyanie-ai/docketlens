/* ============================================================================
 *  scripts/bot-server.ts — persistent Playwright HTTP-driven bot
 *
 *  Launches a real Chrome (persistent context, stealthed) and exposes a
 *  tiny REST API on http://localhost:9999. You can drive it via curl:
 *
 *      curl localhost:9999/snapshot
 *      curl -X POST localhost:9999/goto       -d '{"url":"https://..."}'
 *      curl -X POST localhost:9999/click      -d '{"text":"Create client"}'
 *      curl -X POST localhost:9999/fill       -d '{"label":"Name","value":"X"}'
 *      curl -X POST localhost:9999/screenshot -d '{"name":"foo"}'
 *      curl      localhost:9999/scrape?regex=re_[A-Za-z0-9_]{20,}
 *      curl -X POST localhost:9999/shutdown
 *
 *  Bot stays alive between calls. No page.evaluate (avoids the
 *  `__name is not defined` Playwright bug on this Chrome channel).
 *
 *  Env:
 *    PW_STATE_DIR    persistent context dir (default .playwright-state/bot)
 *    BOT_PORT        listen port (default 9999)
 * ==========================================================================*/

import express from "express";
import { chromium, type BrowserContext, type Page } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const STATE_DIR = path.resolve(process.env.PW_STATE_DIR ?? ".playwright-state/bot");
const PORT = Number(process.env.BOT_PORT ?? 9999);
const OUT = ".audit";

let ctx: BrowserContext | null = null;
let page: Page | null = null;

async function getPage(): Promise<Page> {
  if (page && !page.isClosed()) return page;
  if (ctx) {
    const pages = ctx.pages();
    if (pages.length) {
      page = pages[0];
      return page;
    }
    page = await ctx.newPage();
    return page;
  }
  throw new Error("ctx not initialised");
}

async function start() {
  await mkdir(OUT, { recursive: true });
  ctx = await chromium.launchPersistentContext(STATE_DIR, {
    headless: false,
    channel: "chrome",
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-default-browser-check",
      "--disable-infobars",
    ],
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  page = ctx.pages()[0] ?? (await ctx.newPage());
  console.log(`bot ready @ http://localhost:${PORT}  (state=${STATE_DIR})`);
}

async function snapshot(p: Page) {
  const inputEls = await p.locator("input:visible, textarea:visible, select:visible").all();
  const inputs: Array<Record<string, unknown>> = [];
  for (const el of inputEls) {
    const [name, id, type, placeholder, ariaLabel, value] = await Promise.all([
      el.getAttribute("name").catch(() => null),
      el.getAttribute("id").catch(() => null),
      el.getAttribute("type").catch(() => null),
      el.getAttribute("placeholder").catch(() => null),
      el.getAttribute("aria-label").catch(() => null),
      el.inputValue().catch(() => null),
    ]);
    inputs.push({
      name,
      id,
      type,
      placeholder,
      ariaLabel,
      value: type === "password" ? null : value,
    });
  }
  const btnEls = await p
    .locator("button:visible, [role='button']:visible, input[type='submit']:visible, input[type='button']:visible, a[role='button']:visible")
    .all();
  const buttons: Array<Record<string, unknown>> = [];
  for (const el of btnEls) {
    const [text, aria, dataTestId] = await Promise.all([
      el.textContent().catch(() => null),
      el.getAttribute("aria-label").catch(() => null),
      el.getAttribute("data-testid").catch(() => null),
    ]);
    const t = (text || aria || "").trim().slice(0, 80);
    if (!t) continue;
    buttons.push({ text: t, ariaLabel: aria, dataTestId });
  }
  // Headings
  const hEls = await p.locator("h1:visible, h2:visible, h3:visible").all();
  const headings: string[] = [];
  for (const h of hEls.slice(0, 12)) {
    const t = (await h.textContent().catch(() => null))?.trim().slice(0, 120);
    const tag = (await h.evaluate ? "" : "");
    void tag;
    if (t) headings.push(t);
  }
  // Detect open dialogs / modals
  const dialogOpen = (await p.locator("[role='dialog']:visible, .mdc-dialog--open, .cdk-overlay-pane:visible").count()) > 0;
  return {
    url: p.url(),
    title: await p.title(),
    headings,
    inputs,
    buttons,
    dialogOpen,
    timestamp: new Date().toISOString(),
  };
}

const app = express();
app.use(express.json());

app.get("/snapshot", async (_req, res) => {
  try {
    const snap = await snapshot(await getPage());
    res.json(snap);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/goto", async (req, res) => {
  try {
    const p = await getPage();
    await p.goto(req.body.url, {
      waitUntil: req.body.waitUntil ?? "domcontentloaded",
      timeout: 60_000,
    });
    if (req.body.networkidle !== false)
      await p.waitForLoadState("networkidle").catch(() => {});
    await p.waitForTimeout(req.body.settleMs ?? 1500);
    res.json({ url: p.url(), title: await p.title() });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/click", async (req, res) => {
  try {
    const p = await getPage();
    const { text, selector, exact, nth } = req.body;
    let loc;
    if (selector) loc = p.locator(selector);
    else if (typeof text === "string") loc = p.getByText(text, { exact: exact ?? false });
    else return res.status(400).json({ error: "need text or selector" });
    if (typeof nth === "number") loc = loc.nth(nth);
    else loc = loc.first();
    await loc.click({ timeout: req.body.timeout ?? 15_000 });
    await p.waitForTimeout(req.body.settleMs ?? 800);
    res.json({ clicked: text ?? selector, url: p.url() });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/fill", async (req, res) => {
  try {
    const p = await getPage();
    const { label, selector, value, exact, nth } = req.body;
    let loc;
    if (selector) loc = p.locator(selector);
    else if (label) loc = p.getByLabel(label, { exact: exact ?? false });
    else return res.status(400).json({ error: "need label or selector" });
    if (typeof nth === "number") loc = loc.nth(nth);
    else loc = loc.first();
    await loc.fill(value);
    res.json({ filled: label ?? selector });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/press", async (req, res) => {
  try {
    const p = await getPage();
    await p.keyboard.press(req.body.key);
    res.json({ pressed: req.body.key });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/screenshot", async (req, res) => {
  try {
    const p = await getPage();
    const file = path.join(OUT, `bot-${req.body.name ?? Date.now()}.png`);
    await p.screenshot({ path: file, fullPage: !!req.body.fullPage });
    res.json({ file });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/scrape", async (req, res) => {
  try {
    const p = await getPage();
    const pattern = String(req.query.regex ?? "");
    const flags = String(req.query.flags ?? "g");
    if (!pattern) return res.status(400).json({ error: "need ?regex=..." });
    const re = new RegExp(pattern, flags);
    // Pull values from common containers via locator API
    const out: { source: string; match: string }[] = [];
    for (const sel of [
      "input[readonly]",
      "input[type='text']",
      "textarea",
      "code",
      "pre",
      "span",
      "div",
      "p",
    ]) {
      const els = await p.locator(`${sel}:visible`).all();
      for (const el of els) {
        const v = (await el.getAttribute("value").catch(() => null)) ?? "";
        const t = (await el.textContent().catch(() => null)) ?? "";
        for (const c of [v, t]) {
          const ms = c.matchAll(new RegExp(re.source, flags));
          for (const m of ms) out.push({ source: sel, match: m[0] });
        }
        if (out.length > 50) break;
      }
      if (out.length > 50) break;
    }
    res.json({ matches: out.slice(0, 50) });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/check", async (req, res) => {
  try {
    const p = await getPage();
    const { selector, label } = req.body;
    let loc;
    if (selector) loc = p.locator(selector);
    else if (label) loc = p.getByLabel(label);
    else return res.status(400).json({ error: "need selector or label" });
    await loc.first().check();
    res.json({ checked: selector ?? label });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/wait-for", async (req, res) => {
  try {
    const p = await getPage();
    const { selector, text, timeout } = req.body;
    if (selector)
      await p.locator(selector).first().waitFor({ state: "visible", timeout: timeout ?? 30_000 });
    else if (text)
      await p.getByText(text).first().waitFor({ state: "visible", timeout: timeout ?? 30_000 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/shutdown", async (_req, res) => {
  res.json({ ok: true });
  setTimeout(async () => {
    try {
      await ctx?.close();
    } catch {}
    process.exit(0);
  }, 200);
});

start()
  .then(() => app.listen(PORT))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
