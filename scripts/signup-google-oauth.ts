/* ============================================================================
 *  scripts/signup-google-oauth.ts — create Google OAuth Client ID via bot
 *
 *  Goal: produce GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET for Better-Auth's
 *  "Continue with Google" flow.
 *
 *  Flow:
 *    1. Open Cloud Console credentials page
 *    2. Bot fills email field, clicks Next
 *    3. Bot pauses — user types password + does MFA + handles any
 *       "browser may not be secure" challenge
 *    4. Once landed in Cloud Console, bot waits + dumps page structure to
 *       .audit/gcloud-step.json so the human (or next iteration of this
 *       script) can decide what to click next.
 *
 *  This script intentionally stops after sign-in. The Cloud Console UI
 *  for creating OAuth credentials is multi-step (project select →
 *  OAuth consent screen → credentials → web client → redirect URI)
 *  and each step's selectors change frequently. We capture the state
 *  and the user can guide the next click in chat.
 * ==========================================================================*/

import { chromium, type Page } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const EMAIL = process.env.GOOGLE_EMAIL ?? "ggyanie.ai@gmail.com";
const USER_DATA_DIR = path.resolve(".playwright-state/gcloud");

async function snapshot(page: Page, label: string) {
  const url = page.url();
  const title = await page.title();
  const inputEls = await page.locator("input, textarea, select").all();
  const inputs: Array<Record<string, unknown>> = [];
  for (const el of inputEls) {
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
    .locator("button, [role='button'], input[type='submit']")
    .all();
  const buttons: Array<Record<string, unknown>> = [];
  for (const el of btnEls) {
    const [text, ariaLabel, isVisible] = await Promise.all([
      el.textContent().catch(() => null),
      el.getAttribute("aria-label").catch(() => null),
      el.isVisible().catch(() => false),
    ]);
    if (!isVisible) continue;
    const t = (text || ariaLabel || "").trim().slice(0, 80);
    if (!t) continue;
    buttons.push({ text: t, ariaLabel });
  }
  const out = { label, url, title, inputs, buttons };
  await writeFile(`.audit/gcloud-${label}.json`, JSON.stringify(out, null, 2));
  await page.screenshot({ path: `.audit/gcloud-${label}.png`, fullPage: false }).catch(() => {});
  console.log(`snapshot[${label}] url=${url} title=${title}`);
  return out;
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

  // ── 1. Land on Cloud Console (redirects to Google sign-in if needed) ─
  console.log("Opening console.cloud.google.com/apis/credentials …");
  await page.goto("https://console.cloud.google.com/apis/credentials", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle").catch(() => {});

  const url0 = page.url();
  console.log("Current URL:", url0);

  if (url0.includes("accounts.google.com")) {
    // Fill email if the identifier input is visible
    const idInput = page.locator("#identifierId").first();
    if (await idInput.count()) {
      console.log(`Filling email: ${EMAIL}`);
      await idInput.fill(EMAIL);
      await page
        .locator("button:has-text('Next'), #identifierNext")
        .first()
        .click();
    }
    console.log(
      "\n👤 Now enter your Google password and complete MFA in the browser.\n" +
        "   If Google says 'browser may not be secure', click 'Try again' /\n" +
        "   'Continue anyway' — bot just waits for you to land in Cloud Console.\n"
    );

    // Wait until URL is on console.cloud.google.com (the destination)
    const deadline = Date.now() + 20 * 60_000;
    while (Date.now() < deadline) {
      const u = page.url();
      if (u.startsWith("https://console.cloud.google.com/")) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    const u = page.url();
    if (!u.startsWith("https://console.cloud.google.com/")) {
      console.error("Didn't reach Cloud Console within 20 min. URL:", u);
      await snapshot(page, "stuck");
      await ctx.close();
      process.exit(2);
    }
    console.log("✓ Reached Cloud Console:", u);
  } else {
    console.log("✓ Already signed in.");
  }

  // ── 2. Snapshot the credentials page state ───────────────────────────
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2000);
  await snapshot(page, "credentials");

  console.log(
    "\n📋 Bot paused. Snapshot saved to .audit/gcloud-credentials.json.\n" +
      "   Browser staying open so I can drive the next steps in a follow-up script.\n"
  );

  // Park
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("google bot failed:", err);
  process.exit(1);
});
