/* ============================================================================
 *  scripts/inspect-page.ts — open a URL, dump structure, screenshot
 *
 *  Usage:
 *    pnpm tsx scripts/inspect-page.ts https://example.com/foo
 *      → writes .audit/inspect.json + .audit/inspect.png + leaves the
 *        browser open until you Ctrl+C, so a follow-up script can
 *        attach to the same persistent context.
 * ==========================================================================*/

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const URL = process.argv[2];
if (!URL) {
  console.error("usage: pnpm tsx scripts/inspect-page.ts <url>");
  process.exit(1);
}
const USER_DATA_DIR = path.resolve(
  process.env.PW_STATE_DIR ?? ".playwright-state/courtlistener"
);

async function main() {
  await mkdir(".audit", { recursive: true });
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: "chrome",
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-default-browser-check",
    ],
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await ctx.newPage();
  console.log(`opening: ${URL}`);
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);

  // Use only direct locator getters — page.evaluate() crashes with
  // `__name is not defined` (a Playwright/macOS Chrome internal bug).
  const url = page.url();
  const title = await page.title();
  const headings: string[] = [];
  for (const sel of ["h1", "h2", "h3"]) {
    const els = await page.locator(sel).all();
    for (const el of els.slice(0, 6)) {
      const t = (await el.textContent().catch(() => null))?.trim().slice(0, 120);
      if (t) headings.push(`${sel.toUpperCase()} ${t}`);
    }
  }
  const inputEls = await page.locator("input, textarea, select").all();
  const inputs: Array<Record<string, unknown>> = [];
  for (const el of inputEls) {
    const tag = (await el.evaluate(() => "")).toString(); // avoid evaluate
    void tag;
    const [name, id, type, placeholder, isVisible] = await Promise.all([
      el.getAttribute("name").catch(() => null),
      el.getAttribute("id").catch(() => null),
      el.getAttribute("type").catch(() => null),
      el.getAttribute("placeholder").catch(() => null),
      el.isVisible().catch(() => false),
    ]);
    if (!isVisible) continue;
    inputs.push({ name, id, type, placeholder });
  }
  const btnEls = await page
    .locator("button, input[type='submit'], input[type='button'], a.btn, [role='button']")
    .all();
  const buttons: Array<Record<string, unknown>> = [];
  for (const el of btnEls) {
    const [text, type, isVisible] = await Promise.all([
      el.textContent().catch(() => null),
      el.getAttribute("type").catch(() => null),
      el.isVisible().catch(() => false),
    ]);
    if (!isVisible) continue;
    const t = text?.trim().slice(0, 80);
    if (!t && !type) continue;
    buttons.push({ text: t ?? null, type });
  }
  const captchaSignals: string[] = [];
  if ((await page.locator("iframe[src*='hcaptcha'], .h-captcha").count()) > 0) captchaSignals.push("hcaptcha");
  if ((await page.locator("iframe[src*='recaptcha'], .g-recaptcha").count()) > 0) captchaSignals.push("recaptcha");
  if ((await page.locator("iframe[src*='turnstile'], .cf-turnstile").count()) > 0) captchaSignals.push("turnstile");
  if ((await page.locator("[id*='cf-challenge'], [class*='cf-challenge']").count()) > 0) captchaSignals.push("cloudflare-challenge");

  // Also dump links that look related to API / token / dev so we can find token page.
  const linkEls = await page.locator("a[href]").all();
  const links: Array<{ href: string; text: string }> = [];
  for (const el of linkEls) {
    const [href, text] = await Promise.all([
      el.getAttribute("href").catch(() => null),
      el.textContent().catch(() => null),
    ]);
    if (!href) continue;
    const t = text?.trim().slice(0, 80) ?? "";
    if (/token|api|developer|profile|dev|account/i.test(href + " " + t)) {
      links.push({ href, text: t });
    }
  }
  const snapshot = { url, title, headings, inputs, buttons, captchaSignals, links };

  await page.screenshot({ path: ".audit/inspect.png", fullPage: false });
  await writeFile(".audit/inspect.json", JSON.stringify(snapshot, null, 2));
  console.log("snapshot →", JSON.stringify(snapshot, null, 2));
  console.log("\nbrowser staying open. press Ctrl+C in this terminal when done.");
  // Park indefinitely so the persistent context survives for the follow-up
  // script. The follow-up reuses USER_DATA_DIR.
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
