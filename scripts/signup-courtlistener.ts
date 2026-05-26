/* ============================================================================
 *  scripts/signup-courtlistener.ts — CL signup, bot drives everything
 *
 *  1. Opens /register/?next=/profile/api/ (form fields known via inspect-page.ts:
 *     username, email, password1, password2, first_name, last_name, consent)
 *  2. Fills the form
 *  3. Polls the hidden hcaptcha-response token; once non-empty (= user
 *     solved the captcha), bot auto-clicks "Register"
 *  4. Waits for the success/verification-pending page
 *  5. Polls /profile/api/ in a second tab; when accessible, scrapes the
 *     40-hex token and writes COURTLISTENER_TOKEN to .env.production
 *
 *  No page.evaluate calls — Playwright's UtilityScript crashes with
 *  `__name is not defined` on this Chrome channel.
 * ==========================================================================*/

import { chromium, type Page } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

const EMAIL = process.env.CL_EMAIL ?? "ggyanie.ai@gmail.com";
const FIRST = process.env.CL_FIRST ?? "Ggyanie";
const LAST = process.env.CL_LAST ?? "Rahylu";
const USER_DATA_DIR = path.resolve(".playwright-state/courtlistener");

function genPassword(): string {
  return randomBytes(18).toString("base64url");
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

async function captchaSolved(page: Page): Promise<boolean> {
  // hcaptcha writes its token to <textarea name="h-captcha-response"> or
  // <input name="h-captcha-response">. Non-empty value = solved.
  const els = await page.locator("[name='h-captcha-response']").all();
  for (const el of els) {
    const v = await el.inputValue().catch(() => "");
    if (v && v.length > 20) return true;
  }
  // Also accept Cloudflare Turnstile / Google reCAPTCHA.
  const cf = await page.locator("[name='cf-turnstile-response']").all();
  for (const el of cf) {
    const v = await el.inputValue().catch(() => "");
    if (v && v.length > 20) return true;
  }
  const g = await page.locator("[name='g-recaptcha-response']").all();
  for (const el of g) {
    const v = await el.inputValue().catch(() => "");
    if (v && v.length > 20) return true;
  }
  return false;
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
  const password = genPassword();
  const username = `dl_${randomBytes(4).toString("hex")}`;
  console.log(`Email:    ${EMAIL}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

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

  // Already signed in?
  await page.goto("https://www.courtlistener.com/profile/api/", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (!/sign-in|register/.test(page.url())) {
    console.log("✓ Already signed in — going straight to token capture.");
  } else {
    console.log("Opening /register/…");
    await page.goto(
      "https://www.courtlistener.com/register/?next=/profile/api/",
      { waitUntil: "domcontentloaded", timeout: 30_000 }
    );
    await page.locator("#id_username").waitFor({ state: "visible", timeout: 0 });

    await page.locator("#id_username").fill(username);
    await page.locator("#id_email").fill(EMAIL);
    await page.locator("#id_password1").fill(password);
    await page.locator("#id_password2").fill(password);
    await page.locator("#id_first_name").fill(FIRST);
    await page.locator("#id_last_name").fill(LAST);
    await page.locator("#id_consent").check().catch(() => {});

    await appendEnv(".env.local", "COURTLISTENER_EMAIL", EMAIL);
    await appendEnv(".env.local", "COURTLISTENER_USERNAME", username);
    await appendEnv(".env.local", "COURTLISTENER_PASSWORD", password);

    console.log("\n✅ Form filled. Solve the hCaptcha in the browser.");
    console.log("   The bot will auto-click 'Register' the moment captcha is solved.\n");

    // Poll until captcha is solved.
    const captchaDeadline = Date.now() + 15 * 60_000;
    while (Date.now() < captchaDeadline) {
      if (await captchaSolved(page)) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (!(await captchaSolved(page))) {
      console.error("Captcha not solved within 15 min — aborting.");
      await ctx.close();
      process.exit(2);
    }

    console.log("✓ Captcha solved. Clicking Register…");
    await page.locator("input[type='submit'][value='Register'], button:has-text('Register')").first().click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    console.log("\n📧 Check email for verification link. Click it.");
    console.log("Polling /profile/api/ for token…\n");
  }

  // Token poll loop
  const probe = await ctx.newPage();
  let token: string | null = null;
  const deadline = Date.now() + 20 * 60_000;

  while (Date.now() < deadline) {
    try {
      const resp = await probe.goto(
        "https://www.courtlistener.com/profile/api/",
        { waitUntil: "domcontentloaded", timeout: 15_000 }
      );
      if (resp && resp.status() === 200 && !/sign-in|register/.test(probe.url())) {
        token = await tryGrabToken(probe);
        if (token) break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 5_000));
  }

  if (!token) {
    console.error("\n❌ No token after 20 min. Paste it manually in chat.");
    await ctx.close();
    process.exit(2);
  }

  console.log("\n✓ Captured CourtListener token:", token);
  await appendEnv(".env.production", "COURTLISTENER_TOKEN", token);
  console.log("→ wrote to .env.production");
  await ctx.close();
}

main().catch((err) => {
  console.error("courtlistener bot failed:", err);
  process.exit(1);
});
