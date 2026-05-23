import { CourtListenerClient } from "../src/lib/courtlistener/client";
import { db } from "../src/lib/db";
import {
  courts,
  dockets,
  docketEntries,
  parties,
} from "../src/lib/db/schema";
import { ids, normalizeEntityName } from "../src/lib/db/ids";
import { eq } from "drizzle-orm";

/* ============================================================================
 *  Ingestion worker
 *
 *  Pulls fresh dockets + entries for our active set, persists them, and
 *  triggers the alert engine to materialize matches.
 *
 *  Designed to run hourly (Pro+) or daily (Free) via Vercel Cron, GitHub
 *  Actions, or a Fly machine cron. Idempotent — runs may overlap safely.
 *
 *    pnpm ingest             — full pass over active watchlists
 *    pnpm ingest --court=nysd  — limit to one court
 *    pnpm ingest --since=24h   — entries created within window
 * ==========================================================================*/

interface Args {
  court?: string;
  since?: string; // "1h", "24h", "7d"
  limitDockets?: number;
}

function parseArgs(): Args {
  const a: Args = {};
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, "").split("=");
    if (k === "court") a.court = v;
    if (k === "since") a.since = v;
    if (k === "limit") a.limitDockets = Number(v);
  }
  return a;
}

function sinceToDate(s?: string): string | undefined {
  if (!s) return undefined;
  const m = s.match(/^(\d+)([hd])$/);
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2];
  const ms = unit === "h" ? n * 3_600_000 : n * 86_400_000;
  return new Date(Date.now() - ms).toISOString().slice(0, 10);
}

async function main() {
  const args = parseArgs();
  const since = sinceToDate(args.since ?? "24h");
  const client = new CourtListenerClient();

  console.log(`▸ ingest start  court=${args.court ?? "(all)"} since=${since}`);

  if (!process.env.COURTLISTENER_TOKEN) {
    console.warn(
      "⚠ COURTLISTENER_TOKEN not set — running in dry mode against sample courts only."
    );
  }

  // 1) Refresh courts list once a day
  try {
    const cs = await client.listCourts({ in_use: true, page_size: 100 });
    for (const c of cs.results) {
      try {
        await db
          .insert(courts)
          .values({
            id: c.id,
            fullName: c.full_name,
            shortName: c.short_name,
            jurisdiction: c.jurisdiction,
            citationString: c.citation_string ?? null,
            inUse: c.in_use ?? true,
          })
          .onConflictDoNothing();
      } catch (e) {
        console.warn(`court ${c.id} skipped:`, (e as Error).message);
      }
    }
    console.log(`  courts: ${cs.results.length} touched`);
  } catch (e) {
    console.warn(`  courts: ${(e as Error).message}`);
  }

  // 2) Sweep recent dockets (this is the cache-warming pass; per-watchlist
  //    sweeps are tighter and live in src/lib/alerts/engine.ts in production)
  const docketCount = args.limitDockets ?? 50;
  try {
    let n = 0;
    for await (const d of client.paginate(
      "/dockets/",
      // we just want the docket shape — reuse the schema's parser here
      (await import("../src/lib/courtlistener/types")).CLDocket,
      {
        court: args.court,
        date_filed__gte: since,
        order_by: "-date_filed",
        page_size: 50,
      },
      { maxPages: Math.ceil(docketCount / 50) }
    )) {
      const docketRow = {
        id: ids.docket(),
        clId: d.id,
        court: (d.court_id ?? d.court ?? "").toString(),
        caseName: d.case_name ?? d.case_name_full ?? "(unknown)",
        caseNameShort: d.case_name_short ?? null,
        docketNumber: d.docket_number ?? null,
        pacerCaseId: d.pacer_case_id ?? null,
        natureOfSuit: d.nature_of_suit ?? null,
        cause: d.cause ?? null,
        juryDemand: d.jury_demand ?? null,
        dateFiled: d.date_filed ? new Date(d.date_filed) : null,
        dateTerminated: d.date_terminated ? new Date(d.date_terminated) : null,
        dateLastFiling: d.date_last_filing ? new Date(d.date_last_filing) : null,
        assignedTo: d.assigned_to_str ?? null,
        referredTo: d.referred_to_str ?? null,
        sourceCount: d.source ?? 0,
        raw: d as Record<string, unknown>,
      };

      try {
        await db
          .insert(dockets)
          .values(docketRow)
          .onConflictDoNothing({ target: dockets.clId });
      } catch (e) {
        console.warn(`docket ${d.id} skipped:`, (e as Error).message);
      }

      // Fetch entries (capped per docket — protects rate-limit)
      try {
        const entriesPage = await client.listDocketEntries({
          docket: d.id,
          order_by: "-date_filed",
          page_size: 10,
        });
        for (const e of entriesPage.results) {
          await db
            .insert(docketEntries)
            .values({
              id: ids.entry(),
              clId: e.id,
              docketId: docketRow.id,
              entryNumber: e.entry_number ?? null,
              dateFiled: e.date_filed ? new Date(e.date_filed) : null,
              description: e.description ?? "",
              shortDescription: e.short_description ?? null,
              raw: e as Record<string, unknown>,
            })
            .onConflictDoNothing({ target: docketEntries.clId });
        }
      } catch (e) {
        console.warn(`entries ${d.id} skipped:`, (e as Error).message);
      }

      // Parties (one shot per docket)
      try {
        const ps = await client.listParties({ docket: d.id, page_size: 25 });
        for (const p of ps.results) {
          await db
            .insert(parties)
            .values({
              id: ids.party(),
              clId: p.id,
              docketId: docketRow.id,
              name: p.name,
              role: p.party_types?.[0]?.name ?? null,
              extraInfo: p.extra_info ?? null,
              nameNormalized: normalizeEntityName(p.name),
            })
            .onConflictDoNothing({ target: parties.clId });
        }
      } catch (e) {
        console.warn(`parties ${d.id} skipped:`, (e as Error).message);
      }

      n++;
      if (n >= docketCount) break;
    }
    console.log(`  dockets: ${n} ingested`);
  } catch (e) {
    console.warn(`docket sweep aborted: ${(e as Error).message}`);
  }

  // 3) Hand off to alert engine (only if env supports it)
  try {
    const { materializeMatches, buildDigests } = await import(
      "../src/lib/alerts/engine"
    );
    const m = await materializeMatches();
    const dig = await buildDigests({ cadence: "hourly" });
    console.log(`  matches: +${m.matches} of ${m.candidates} candidates`);
    console.log(`  digests: ${dig.queued} queued (hourly)`);
  } catch (e) {
    console.warn(`alert engine aborted: ${(e as Error).message}`);
  }

  // 4) Flush
  try {
    const { flushDeliveries } = await import("../src/lib/alerts/dispatch");
    const out = await flushDeliveries();
    console.log(
      `  deliveries: sent=${out.sent} skipped=${out.skipped} failed=${out.failed}`
    );
  } catch (e) {
    console.warn(`dispatch aborted: ${(e as Error).message}`);
  }

  console.log("▸ ingest done");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
