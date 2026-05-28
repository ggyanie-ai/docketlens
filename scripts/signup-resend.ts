/* ============================================================================
 *  scripts/signup-resend.ts — Resend signup via Google OAuth, then capture API key
 *
 *  Flow:
 *    1. Open /signup; click "Log in with Google"
 *    2. Bot pauses: user signs in to Google (handles MFA / captcha / browser-
 *       not-secure clicks themselves). Bot polls page URL.
 *    3. When URL is back on resend.com (not google.*, not /signup), proceed.
 *    4. Navigate to /api-keys. If a key already exists, scrape it. Otherwise
 *       click "Create API Key", give it the name "docketlens-prod", submit,
 *       then scrape the freshly-revealed key.
 *    5. Write RESEND_API_KEY to .env.production.
 *
 *  Stealth measures (because Google flags Playwright Chrome as "browser may
 *  not be secure" by default):
 *    - channel: "chrome"          → real Chrome binary, not bundled Chromium
 *    - --disable-blink-features=AutomationControlled
 *    - ignoreDefaultArgs: --enable-automation
 *    - navigator.webdriver = undefined via init script
 *    - Persistent context: cookies + IndexedDB persist across runs, so the
 *      Google session reused once the user signed in.
 *    - User-Agent is left as Chrome's default (not Playwright-customized).
 *
 *  If Google still blocks with "browser may not be secure", the user can
 *  click around manually — the bot is just waiting on URL change.
 * ==========================================================================*/

import { chromium, type Page } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const USER_DATA_DIR = path.resolve(".playwright-state/resend");

async function appendEnv(file: string, key: string, value: string) {
  let body = "";
  try {
    body = await readFile(file, "utf8");
  } catch {}
  const lines = body
    .split("\n")
    .filter((l) => !l.startsWith(`${key}=`) && l.trim() !== "");
  lines.push(`${key}=${value}`);
  await writeFile(file, lines.join("\n") + "\n");
}

async function tryGrabApiKey(page: Page): Promise<string | null> {
  for (const sel of ["input[readonly]", "input[type='text']", "code", "pre", "[role='textbox']"]) {
    const els = await page.locator(sel).all();
    for (const el of els) {
      const v = (await el.getAttribute("value").catch(() => null)) ?? "";
      const t = (await el.textContent().catch(() => null)) ?? "";
      for (const c of [v, t]) {
        const m = c.match(/\bre_[A-Za-z0-9_]{20,}\b/);
        if (m) return m[0];
      }
    }
  }
  return null;
}

async function waitForResendSignedIn(page: Page, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const u = page.url();
    if (
      u.startsWith("https://resend.com/") &&
      !/\/signup|\/login|\/verify/i.test(u)
    ) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

async function main() {
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
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

  const page = await ctx.newPage();

  // ── 1. Already signed in? ─────────────────────────────────────────────
  console.log("Checking session at /api-keys…");
  await page.goto("https://resend.com/api-keys", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (!/\/login|\/signup/.test(page.url())) {
    console.log("✓ Already signed in. Jumping to API key capture.");
  } else {
    console.log("Not signed in. Opening signup → Google OAuth…");
    await page.goto("https://resend.com/signup", {
      waitUntil: "domcontentloaded",
    });
    await page
      .locator("button:has-text('Google'), button:has-text('Log in with Google'), button:has-text('Continue with Google')")
      .first()
      .waitFor({ state: "visible", timeout: 30_000 });
    await page
      .locator("button:has-text('Google'), button:has-text('Log in with Google'), button:has-text('Continue with Google')")
      .first()
      .click();

    console.log(
      "\n👤 Sign in to Google with ggyanie.ai@gmail.com in the browser.\n" +
        "   Handle MFA / 'browser not secure' / any captcha if Google shows them.\n" +
        "   The bot is waiting silently — no further action from me until you land back on resend.com.\n"
    );

    const ok = await waitForResendSignedIn(page, 20 * 60_000);
    if (!ok) {
      console.error("Didn't reach a signed-in resend.com URL within 20 min.");
      console.error("Current URL:", page.url());
      await ctx.close();
      process.exit(2);
    }
    console.log("✓ Signed in to Resend. URL:", page.url());
  }

  // ── 2. Capture (or create) an API key ─────────────────────────────────
  console.log("\nOpening /api-keys…");
  await page.goto("https://resend.com/api-keys", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);

  let key = await tryGrabApiKey(page);
  if (!key) {
    console.log("No existing key visible. Creating one…");
    const createBtn = page
      .locator(
        "button:has-text('Create API Key'), a:has-text('Create API Key'), button:has-text('Create')"
      )
      .first();
    if (await createBtn.count()) {
      await createBtn.click();
      await page.waitForTimeout(1500);
      const nameInput = page
        .locator("input[placeholder*='name' i], input[name*='name' i], #name")
        .first();
      if (await nameInput.count()) {
        await nameInput.fill("docketlens-prod");
      }
      const submit = page
        .locator("button:has-text('Add'), button:has-text('Create')")
        .last();
      if (await submit.count()) {
        await submit.click();
        await page.waitForTimeout(3000);
      }
    }
    key = await tryGrabApiKey(page);
  }

  if (!key) {
    console.error("\n❌ Could not auto-create/capture key.");
    console.error("→ Browser left open. Create one manually and paste re_… in chat.");
    await page.screenshot({ path: ".audit/resend-no-key.png", fullPage: true }).catch(() => {});
    await page.waitForTimeout(10 * 60_000);
    process.exit(2);
  }

  console.log("\n✓ Captured Resend API key:", key);
  await appendEnv(".env.production", "RESEND_API_KEY", key);
  console.log("→ wrote to .env.production");
  await ctx.close();
}

main().catch((err) => {
  console.error("resend bot failed:", err);
  process.exit(1);
});
