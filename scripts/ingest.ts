import { runIngest, type IngestOptions } from "../src/lib/ingest/run";

/* ============================================================================
 *  scripts/ingest.ts — CLI wrapper around src/lib/ingest/run.ts
 *
 *  Usage:
 *    pnpm ingest                 — full pass, default 24h window
 *    pnpm ingest --court=nysd    — single court
 *    pnpm ingest --since=1h      — entries within window
 *    pnpm ingest --limit=20      — cap dockets ingested
 *
 *  Same logic runs from the Vercel cron at /api/cron/ingest hourly.
 * ==========================================================================*/

function parseArgs(): IngestOptions {
  const a: IngestOptions = {};
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, "").split("=");
    if (k === "court") a.court = v;
    if (k === "since") a.since = v;
    if (k === "limit") a.limitDockets = Number(v);
  }
  return a;
}

async function main() {
  const opts = parseArgs();
  console.log(
    `▸ ingest start  court=${opts.court ?? "(all)"} since=${opts.since ?? "24h"} limit=${opts.limitDockets ?? 50}`
  );
  if (!process.env.COURTLISTENER_TOKEN) {
    console.warn("⚠ COURTLISTENER_TOKEN not set — calls to CourtListener will be unauthenticated.");
  }
  const stats = await runIngest(opts);
  console.log(`  courts:     ${stats.courtsTouched} touched`);
  console.log(`  dockets:    ${stats.docketsIngested} ingested`);
  console.log(`  matches:    +${stats.matches} of ${stats.candidates} candidates`);
  console.log(`  digests:    ${stats.digestsQueued} queued (hourly)`);
  console.log(
    `  deliveries: sent=${stats.deliveriesSent} skipped=${stats.deliveriesSkipped} failed=${stats.deliveriesFailed}`
  );
  if (stats.errors.length) {
    console.log(`  errors:     ${stats.errors.length}`);
    for (const e of stats.errors.slice(0, 5)) console.log(`    - ${e}`);
  }
  console.log(`▸ ingest done  ${stats.durationMs} ms`);
  process.exit(stats.ok ? 0 : 0); // non-fatal — cron retries hourly
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
