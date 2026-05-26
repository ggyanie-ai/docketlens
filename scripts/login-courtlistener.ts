/* ============================================================================
 *  scripts/login-courtlistener.ts — log in + grab token
 *
 *  Reads credentials from .env.local (written by signup-courtlistener.ts).
 *  Form: #username, #password, "Sign In" submit. No captcha on sign-in.
 *
 *  After login, navigates to /profile/api/, scrapes the 40-hex token,
 *  writes COURTLISTENER_TOKEN to .env.production.
 * ==========================================================================*/

import { chromium, type Page } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const USER_DATA_DIR = path.resolve(".playwright-state/courtlistener");

async function readEnvFile(file: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const raw = await readFile(file, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {}
  return out;
}

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

async function tryGrabToken(page: Page): Promise<string | null> {
  for (const sel of ["input[readonly]", "code", "pre"]) {
    const els = await page.locator(sel).all();
    for (const el of els) {
      const v = (await el.getAttribute("value").catch(() => null)) ?? "";
      const t = (await el.textContent().catch(() => null)) ?? "";
      for (const candidate of [v, t]) {
        const m = candidate.match(/\b[0-9a-f]{40}\b/);
        if (m) return m[0];
      }
    }
  }
  return null;
}

async function main() {
  const env = await readEnvFile(".env.local");
  const username = env.COURTLISTENER_USERNAME;
  const password = env.COURTLISTENER_PASSWORD;
  if (!username || !password) {
    console.error("Missing COURTLISTENER_USERNAME/PASSWORD in .env.local");
    process.exit(1);
  }
  console.log(`Logging in as ${username}…`);

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

  // Skip login if already signed in.
  await page.goto("https://www.courtlistener.com/profile/api/", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (/sign-in|register/.test(page.url())) {
    console.log("Not signed in — going to /sign-in/");
    await page.goto("https://www.courtlistener.com/sign-in/", {
      waitUntil: "domcontentloaded",
    });
    await page.locator("#username").waitFor({ state: "visible", timeout: 30_000 });
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await page
      .locator("input[type='submit'][value*='Sign In' i], button:has-text('Sign In')")
      .first()
      .click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    console.log("Submitted — current URL:", page.url());
  } else {
    console.log("Already signed in.");
  }

  // Navigate to /profile/api/ and grab the token.
  await page.goto("https://www.courtlistener.com/profile/api/", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (/sign-in|register/.test(page.url())) {
    console.error("Login failed — still being redirected to sign-in. Page:", page.url());
    await page.screenshot({ path: ".audit/cl-login-failed.png", fullPage: true }).catch(() => {});
    await ctx.close();
    process.exit(2);
  }
  // The /profile/api/ page has 4 tabs: API Documentation, Your API Token,
  // API Usage, Webhooks. The token lives behind the second tab.
  console.log("Clicking 'Your API Token' tab…");
  await page
    .locator("a:has-text('Your API Token'), button:has-text('Your API Token')")
    .first()
    .click()
    .catch(async () => {
      // Sometimes Bootstrap tabs use a direct URL — try the canonical one.
      await page.goto("https://www.courtlistener.com/profile/api/token/", {
        waitUntil: "domcontentloaded",
      });
    });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);
  const token = await tryGrabToken(page);
  if (!token) {
    console.error("Couldn't find token on /profile/api/. URL:", page.url());
    await page.screenshot({ path: ".audit/cl-no-token.png", fullPage: true }).catch(() => {});
    await ctx.close();
    process.exit(2);
  }

  console.log("✓ Captured CourtListener token:", token);
  await appendEnv(".env.production", "COURTLISTENER_TOKEN", token);
  console.log("→ wrote to .env.production");
  await ctx.close();
}

main().catch((err) => {
  console.error("login bot failed:", err);
  process.exit(1);
});
