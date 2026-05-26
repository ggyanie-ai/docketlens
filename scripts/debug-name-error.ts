import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

async function main() {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const jsHits: { url: string; refs: number; defs: number; snippet: string }[] = [];

  page.on("response", async (r) => {
    const url = r.url();
    if (!url.endsWith(".js") && !url.includes("/_next/")) return;
    if (r.status() !== 200) return;
    try {
      const body = await r.text();
      const refs = (body.match(/__name\(/g) || []).length;
      const defs = (body.match(/(?:var|let|const|function) __name\s*[=(]/g) || []).length;
      if (refs > 0 || defs > 0) {
        const m = body.match(/[^\s]{0,40}__name[^\s]{0,80}/);
        jsHits.push({ url, refs, defs, snippet: m?.[0] ?? "" });
      }
    } catch {}
  });

  page.on("pageerror", (e) => {
    console.log("PAGE ERROR:", e.message);
    console.log("STACK:\n" + e.stack);
  });

  await page.goto("https://docketlens-pi.vercel.app/", {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.waitForTimeout(3000);

  console.log("\n--- chunks referencing or defining __name ---");
  for (const h of jsHits) {
    console.log(`refs=${h.refs} defs=${h.defs} ${h.url}`);
    console.log("  →", h.snippet);
  }
  if (jsHits.length === 0) console.log("(none — error may come from inline script or eval)");

  await writeFile(".audit/name-hits.json", JSON.stringify(jsHits, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
