/* ============================================================================
 *  scripts/signup-neon.ts — drive Neon project creation via Playwright
 *
 *  Opens a real Chromium window (HEADED) at console.neon.tech. The user
 *  clicks "Continue with Google" + completes any MFA. After they land on
 *  the Neon dashboard, the script takes over: creates the docketlens
 *  project, opens the connection string drawer, copies the pooled URL,
 *  and writes it to .env.production locally.
 *
 *  Usage:
 *    pnpm tsx scripts/signup-neon.ts
 *
 *  No Neon API key needed — every action is browser-driven, then the
 *  resulting connection string is captured.
 * ==========================================================================*/

import { chromium } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_NAME = "docketlens";
const USER_DATA_DIR = path.resolve(".playwright-state/neon");

async function appendEnv(key: string, value: string) {
  const file = path.resolve(".env.production");
  let body = "";
  try {
    body = await readFile(file, "utf8");
  } catch {}
  const lines = body.split("\n").filter((l) => !l.startsWith(`${key}=`) && l.trim() !== "");
  lines.push(`${key}=${value}`);
  await writeFile(file, lines.join("\n") + "\n");
  console.log(`✓ wrote ${key} to .env.production`);
}

async function main() {
  console.log("Launching Chromium → console.neon.tech");
  console.log("Sign in with Google when the browser opens. I'll take over after the dashboard loads.\n");

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: "chrome", // use the real installed Chrome, not bundled Chromium
    viewport: { width: 1280, height: 900 },
    // Strip the --enable-automation flag so Google's OAuth doesn't reject
    // the sign-in as "this browser may not be secure".
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-default-browser-check",
    ],
  });
  // Mask navigator.webdriver before any page loads.
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await ctx.newPage();
  await page.goto("https://console.neon.tech/signin", { waitUntil: "domcontentloaded" });

  // Wait until we land on a real dashboard URL (signed-in state).
  console.log("Waiting for sign-in to complete (no timeout — take your time on OAuth/MFA)…");
  await page.waitForURL(/console\.neon\.tech\/app/, { timeout: 0 });
  console.log("Signed in. Looking for a `docketlens` project…");

  // Give the page a moment to render the project list.
  await page.waitForLoadState("networkidle").catch(() => {});

  // Click into existing project if name matches.
  const existing = page.getByRole("link", { name: PROJECT_NAME, exact: false }).first();
  if (await existing.count()) {
    console.log("Found existing project — opening it.");
    await existing.click();
  } else {
    // Try the "New Project" or "Create" button — Neon uses several variants.
    console.log("No existing project found. Creating one…");
    const newBtn = page
      .getByRole("button", { name: /new project|create project|create/i })
      .first();
    await newBtn.click({ timeout: 15_000 });

    // Fill the create form. Neon's create dialog wants name + region.
    await page.getByLabel(/project name/i).first().fill(PROJECT_NAME).catch(async () => {
      await page.locator("input[name='name']").first().fill(PROJECT_NAME);
    });

    // Submit
    await page.getByRole("button", { name: /^create( project)?$/i }).first().click();
    await page.waitForLoadState("networkidle").catch(() => {});
  }

  // Now extract the pooled connection string. Neon dashboards expose it
  // either inline on the project page or behind a "Connect" / "Connection
  // string" button. We try the most common surface first.
  console.log("Hunting for connection string…");

  // Try clicking "Connect" or "Connection string" if it's behind a panel.
  for (const label of ["Connect", "Connection string", "Connection Details"]) {
    const btn = page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }).first();
    if (await btn.count()) {
      await btn.click().catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(800);

  // Ensure the "Pooled connection" toggle is on. Neon labels this variously.
  const pooledToggle = page.getByText(/pooled connection|connection pooling/i).first();
  if (await pooledToggle.count()) {
    // The toggle may be a switch sibling; clicking the label often works.
    await pooledToggle.click({ trial: true }).catch(() => {});
  }

  // The connection string usually lives in a readonly <input> or <code> element.
  // Grab all candidates and pick the longest postgres:// URL.
  const candidates = await page
    .locator("input[readonly], code, [class*='connection']")
    .allTextContents();
  const inputs = await page.locator("input[readonly]").evaluateAll((els) =>
    els.map((el) => (el as HTMLInputElement).value)
  );
  const all = [...candidates, ...inputs].filter((s) =>
    /^postgres(?:ql)?:\/\//.test(s)
  );
  const url = all.sort((a, b) => b.length - a.length)[0];

  if (!url) {
    console.error("Could not auto-detect the connection string on the page.");
    console.error("Browser is staying open — copy it manually and paste back into chat.");
    console.error("Press Ctrl+C in this terminal when done.");
    await page.waitForTimeout(10 * 60_000);
    process.exit(2);
  }

  console.log("Captured connection string:");
  console.log(url);
  await appendEnv("DATABASE_URL", url);
  await ctx.close();
}

main().catch((err) => {
  console.error("signup-neon failed:", err);
  process.exit(1);
});
