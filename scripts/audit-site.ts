/* ============================================================================
 *  scripts/audit-site.ts — Playwright walkthrough of prod
 *
 *  Visits the production site as if I were a paid user, captures
 *  screenshots, console errors, render-time, and visible content
 *  signals at each stop. Output: .audit/ folder with PNGs + JSON
 *  report I read back at the end.
 * ==========================================================================*/

import { chromium, type ConsoleMessage } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.AUDIT_BASE ?? "https://docketlens-pi.vercel.app";
const OUT = ".audit";

const PATHS: { url: string; label: string; mode?: "marketing" | "app" | "tool" }[] = [
  // Marketing
  { url: "/", label: "00-landing", mode: "marketing" },
  { url: "/pricing", label: "01-pricing", mode: "marketing" },
  { url: "/about", label: "02-about", mode: "marketing" },
  { url: "/demo", label: "03-demo-index", mode: "marketing" },
  { url: "/demo/dkt_ftc_v_aurora", label: "04-demo-docket", mode: "marketing" },
  { url: "/comparison", label: "05-comparison", mode: "marketing" },
  { url: "/vs/pacer", label: "06-vs-pacer", mode: "marketing" },
  { url: "/vs/lex-machina", label: "07-vs-lex-machina", mode: "marketing" },
  { url: "/use/journalists", label: "08-use-journalists", mode: "marketing" },
  { url: "/use/investors", label: "09-use-investors", mode: "marketing" },
  { url: "/use/lawyers", label: "10-use-lawyers", mode: "marketing" },

  // Reference / depth
  { url: "/jurisdictions", label: "11-jurisdictions", mode: "marketing" },
  { url: "/glossary", label: "12-glossary", mode: "marketing" },
  { url: "/docs", label: "13-docs-index", mode: "marketing" },
  { url: "/docs/api-reference", label: "14-api-reference", mode: "marketing" },
  { url: "/docs/architecture", label: "15-architecture", mode: "marketing" },
  { url: "/docs/accessibility", label: "16-a11y", mode: "marketing" },
  { url: "/blog", label: "17-blog-index", mode: "marketing" },
  { url: "/blog/prompt-pinning-stale-flag", label: "18-blog-post", mode: "marketing" },

  // Tools + ops surfaces
  { url: "/tools/verify-webhook", label: "19-webhook-verifier", mode: "tool" },
  { url: "/feeds", label: "20-feeds", mode: "tool" },
  { url: "/changelog", label: "21-changelog", mode: "marketing" },
  { url: "/status", label: "22-status", mode: "marketing" },
  { url: "/widget", label: "23-widget-index", mode: "tool" },

  // App (gated, will likely redirect or show fallback)
  { url: "/dashboard", label: "30-dashboard", mode: "app" },
  { url: "/search", label: "31-search", mode: "app" },
  { url: "/watchlists", label: "32-watchlists", mode: "app" },
  { url: "/watchlists/wl_apple", label: "33-watchlist-detail", mode: "app" },
  { url: "/alerts", label: "34-alerts", mode: "app" },
  { url: "/inbox", label: "35-inbox", mode: "app" },
  { url: "/settings", label: "36-settings", mode: "app" },
  { url: "/api-keys", label: "37-api-keys", mode: "app" },
  { url: "/audit-log", label: "38-audit-log", mode: "app" },

  // Auth
  { url: "/login", label: "40-login", mode: "marketing" },
  { url: "/signup", label: "41-signup", mode: "marketing" },

  // Legal
  { url: "/legal/privacy", label: "42-privacy", mode: "marketing" },
  { url: "/legal/terms", label: "43-terms", mode: "marketing" },
  { url: "/legal/data-sources", label: "44-data-sources", mode: "marketing" },
];

type Result = {
  label: string;
  url: string;
  status: number | null;
  title: string;
  durationMs: number;
  consoleErrors: string[];
  pageErrors: string[];
  jsonLdCount: number;
  h1: string | null;
  redirectedTo: string | null;
  screenshot: string;
};

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-extensions",
      "--no-default-browser-check",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36",
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const results: Result[] = [];

  for (const stop of PATHS) {
    const page = await ctx.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 240));
    });
    page.on("pageerror", (e) => {
      pageErrors.push((e.stack ?? e.message).slice(0, 600));
    });

    const url = `${BASE}${stop.url}`;
    const t0 = Date.now();
    let status: number | null = null;
    let redirectedTo: string | null = null;

    try {
      const resp = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      status = resp?.status() ?? null;
      const finalUrl = page.url();
      if (finalUrl !== url) redirectedTo = finalUrl;
    } catch (err) {
      pageErrors.push((err as Error).message.slice(0, 240));
    }
    const durationMs = Date.now() - t0;

    const title = (await page.title()).slice(0, 120);
    const h1 = await page
      .locator("h1")
      .first()
      .textContent({ timeout: 1500 })
      .then((t) => t?.trim().slice(0, 140) ?? null)
      .catch(() => null);
    const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
    const screenshotPath = path.join(OUT, `${stop.label}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true, scale: "css" }).catch(() => {});

    const r: Result = {
      label: stop.label,
      url: stop.url,
      status,
      title,
      durationMs,
      consoleErrors,
      pageErrors,
      jsonLdCount,
      h1,
      redirectedTo,
      screenshot: screenshotPath,
    };
    results.push(r);
    const flag =
      pageErrors.length > 0
        ? "💥"
        : consoleErrors.length > 0
        ? "⚠️ "
        : status === 200
        ? "✓"
        : `${status}`;
    console.log(
      `${flag} ${stop.label.padEnd(28)} ${String(durationMs).padStart(5)}ms  ${stop.url}`
    );
    if (pageErrors.length > 0) console.log("    PAGE ERR:", pageErrors[0]);
    await page.close();
  }

  await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nReport: ${path.join(OUT, "report.json")}`);
  console.log(`Screenshots: ${OUT}/*.png`);

  await ctx.close();
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
