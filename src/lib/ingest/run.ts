import { CourtListenerClient } from "@/lib/courtlistener/client";
import { db } from "@/lib/db";
import {
  courts,
  dockets,
  docketEntries,
  parties,
} from "@/lib/db/schema";
import { ids, normalizeEntityName } from "@/lib/db/ids";

/* ============================================================================
 *  Ingestion worker — core logic shared between the CLI (scripts/ingest.ts)
 *  and the Vercel cron route (app/api/cron/ingest).
 *
 *  Idempotent — runs may overlap safely (onConflictDoNothing everywhere).
 *  Returns a stats object so the caller can log / return JSON.
 * ==========================================================================*/

export interface IngestOptions {
  court?: string;
  /** "1h", "24h", "7d" — relative window for date_filed */
  since?: string;
  /** Hard cap on dockets to sweep this pass */
  limitDockets?: number;
}

export interface IngestStats {
  ok: boolean;
  courtsTouched: number;
  docketsIngested: number;
  matches: number;
  candidates: number;
  digestsQueued: number;
  deliveriesSent: number;
  deliveriesSkipped: number;
  deliveriesFailed: number;
  durationMs: number;
  errors: string[];
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

export async function runIngest(opts: IngestOptions = {}): Promise<IngestStats> {
  const t0 = Date.now();
  const since = sinceToDate(opts.since ?? "24h");
  const client = new CourtListenerClient();
  const errors: string[] = [];

  let courtsTouched = 0;
  let docketsIngested = 0;
  let matches = 0;
  let candidates = 0;
  let digestsQueued = 0;
  let deliveriesSent = 0;
  let deliveriesSkipped = 0;
  let deliveriesFailed = 0;

  // 1) Refresh courts list
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
        errors.push(`court ${c.id}: ${(e as Error).message}`);
      }
    }
    courtsTouched = cs.results.length;
  } catch (e) {
    errors.push(`courts: ${(e as Error).message}`);
  }

  // 2) Sweep recent dockets
  const docketCap = opts.limitDockets ?? 50;
  try {
    const { CLDocket } = await import("@/lib/courtlistener/types");
    let n = 0;
    for await (const d of client.paginate(
      "/dockets/",
      CLDocket,
      {
        court: opts.court,
        date_filed__gte: since,
        order_by: "-date_filed",
        page_size: 50,
      },
      { maxPages: Math.ceil(docketCap / 50) }
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
        errors.push(`docket ${d.id}: ${(e as Error).message}`);
      }

      // Per-docket entries (cap of 10 per pass)
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
        errors.push(`entries ${d.id}: ${(e as Error).message}`);
      }

      // Parties
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
        errors.push(`parties ${d.id}: ${(e as Error).message}`);
      }

      n++;
      if (n >= docketCap) break;
    }
    docketsIngested = n;
  } catch (e) {
    errors.push(`docket sweep: ${(e as Error).message}`);
  }

  // 3) Alert engine
  try {
    const { materializeMatches, buildDigests } = await import("@/lib/alerts/engine");
    const m = await materializeMatches();
    matches = m.matches;
    candidates = m.candidates;
    const dig = await buildDigests({ cadence: "hourly" });
    digestsQueued = dig.queued;
  } catch (e) {
    errors.push(`alerts: ${(e as Error).message}`);
  }

  // 4) Flush deliveries (email + webhook)
  try {
    const { flushDeliveries } = await import("@/lib/alerts/dispatch");
    const out = await flushDeliveries();
    deliveriesSent = out.sent;
    deliveriesSkipped = out.skipped;
    deliveriesFailed = out.failed;
  } catch (e) {
    errors.push(`dispatch: ${(e as Error).message}`);
  }

  return {
    ok: errors.length === 0,
    courtsTouched,
    docketsIngested,
    matches,
    candidates,
    digestsQueued,
    deliveriesSent,
    deliveriesSkipped,
    deliveriesFailed,
    durationMs: Date.now() - t0,
    errors,
  };
}
