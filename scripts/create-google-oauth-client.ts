/* ============================================================================
 *  scripts/create-google-oauth-client.ts — capture OAuth Client ID + Secret
 *
 *  Hybrid bot+human flow:
 *    1. Bot opens /auth/clients/create
 *    2. Bot pauses with clear instructions for the user:
 *         - Application type: Web application
 *         - Name: DocketLens prod
 *         - Authorized redirect URI: <REDIRECT>
 *         - Click Create
 *    3. After clicking Create, Google shows a modal with Client ID +
 *       Client Secret. Bot polls the DOM for those values and writes them
 *       to .env.production.
 *
 *  Why hybrid: Google's Cloud Console uses Polymer / MDC components with
 *  shadow DOM and dynamic field reveals (Name + URI only appear after
 *  Application Type is selected). Auto-filling those is brittle. Scraping
 *  the OUTPUT (the post-create modal) is reliable.
 * ==========================================================================*/

import { chromium, type Page } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const USER_DATA_DIR = path.resolve(".playwright-state/gcloud");
const REDIRECT_URI =
  process.env.OAUTH_REDIRECT ?? "https://docketlens-pi.vercel.app/api/auth/callback/google";
const CLIENT_NAME = process.env.OAUTH_CLIENT_NAME ?? "DocketLens prod";

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

async function scrape(page: Page): Promise<{ id: string | null; secret: string | null }> {
  let id: string | null = null;
  let secret: string | null = null;
  for (const sel of ["input[readonly]", "input[type='text']", "code", "span", "div", "p"]) {
    const els = await page.locator(sel).all();
    for (const el of els) {
      const v = (await el.getAttribute("value").catch(() => null)) ?? "";
      const t = (await el.textContent().catch(() => null)) ?? "";
      for (const c of [v, t]) {
        const idM = c.match(/\b\d{8,15}-[a-z0-9]{16,}\.apps\.googleusercontent\.com\b/);
        if (idM && !id) id = idM[0];
        const secM = c.match(/\bGOCSPX-[A-Za-z0-9_-]{20,}\b/);
        if (secM && !secret) secret = secM[0];
      }
    }
  }
  return { id, secret };
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
    ],
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await ctx.newPage();

  console.log("Opening /auth/clients/create …");
  await page.goto("https://console.cloud.google.com/auth/clients/create", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);

  console.log("\n👤 In the browser, fill the form:");
  console.log(`   • Application type:   Web application`);
  console.log(`   • Name:                ${CLIENT_NAME}`);
  console.log(`   • Authorized redirect URI:  ${REDIRECT_URI}`);
  console.log(`   • (skip Authorized JavaScript origins)`);
  console.log(`   • Click   Create`);
  console.log(
    "\nAfter you click Create, Google opens a modal with the Client ID + Secret."
  );
  console.log("I'll watch the DOM and grab both values automatically.\n");

  // Poll for the modal — usually a dialog with the two values.
  const deadline = Date.now() + 15 * 60_000;
  let id: string | null = null;
  let secret: string | null = null;
  while (Date.now() < deadline) {
    const result = await scrape(page);
    if (result.id) id = id ?? result.id;
    if (result.secret) secret = secret ?? result.secret;
    if (id && secret) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!id || !secret) {
    console.error("Didn't capture both values in 15 min.");
    console.error("  client_id:    ", id ?? "(missing)");
    console.error("  client_secret:", secret ? "(found)" : "(missing)");
    await ctx.close();
    process.exit(2);
  }

  console.log("\n✓ Captured.");
  console.log(`  GOOGLE_CLIENT_ID = ${id}`);
  console.log(`  GOOGLE_CLIENT_SECRET = ${secret}`);
  await appendEnv(".env.production", "GOOGLE_CLIENT_ID", id);
  await appendEnv(".env.production", "GOOGLE_CLIENT_SECRET", secret);
  console.log("→ wrote to .env.production");
  await ctx.close();
}

main().catch((err) => {
  console.error("create-google-oauth-client failed:", err);
  process.exit(1);
});
