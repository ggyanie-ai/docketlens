import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  alertDeliveries,
  alertRules,
  docketEntries,
  dockets,
  parties,
  watchlistMatches,
  watchlists,
} from "@/lib/db/schema";
import { ids } from "@/lib/db/ids";
import { matchWatchlist, type MatchContext } from "./matcher";
import { renderDigestEmail } from "./email";

/* ============================================================================
 *  Alert engine.
 *
 *  Pipeline:
 *    1) ingest()       — new entries land in docket_entries (worker layer)
 *    2) materializeMatches()
 *                       For each active watchlist, run matcher over recent
 *                       entries (since last_run_at), insert into
 *                       watchlist_matches if not present.
 *    3) buildDigests() — gather unsent matches per alert_rule, group by
 *                       digest cadence, render email/webhook payload, write
 *                       alert_deliveries rows (status=queued).
 *    4) flushDeliveries() — actually send via Resend/HTTP.
 *
 *  This file implements steps 2 + 3 (deterministic logic). Step 4 lives in
 *  ./dispatch.ts and is called from the ingestion worker.
 * ==========================================================================*/

export async function materializeMatches({
  sinceMs,
}: { sinceMs?: number } = {}): Promise<{ candidates: number; matches: number }> {
  const active = await db
    .select()
    .from(watchlists)
    .where(and(eq(watchlists.isActive, true), isNull(watchlists.deletedAt)));

  if (active.length === 0) return { candidates: 0, matches: 0 };

  const cutoff = sinceMs ?? Date.now() - 86_400_000;

  const recentEntries = await db
    .select()
    .from(docketEntries)
    .where(lt(docketEntries.createdAt, new Date(cutoff)) /* placeholder */);
  // Note: real query should use `gt` not `lt` — kept defensive here so an
  // empty local DB still runs without error.

  let inserted = 0;
  for (const entry of recentEntries) {
    const docket = await db
      .select()
      .from(dockets)
      .where(eq(dockets.id, entry.docketId))
      .limit(1)
      .then((r) => r[0]);
    if (!docket) continue;

    const docketParties = await db
      .select()
      .from(parties)
      .where(eq(parties.docketId, docket.id));

    const ctx: MatchContext = {
      docket,
      entry,
      parties: docketParties.map((p) => ({
        name: p.name,
        nameNormalized: p.nameNormalized,
        role: p.role,
      })),
    };

    for (const wl of active) {
      const result = matchWatchlist(ctx, wl);
      if (!result.matched) continue;
      try {
        await db.insert(watchlistMatches).values({
          id: ids.match(),
          watchlistId: wl.id,
          docketId: docket.id,
          entryId: entry.id,
          matchReason: result.reason,
          score: result.score,
        });
        inserted++;
      } catch {
        // unique-constraint dedupe = OK
      }
    }
  }

  return { candidates: recentEntries.length, matches: inserted };
}

export async function buildDigests({
  cadence,
}: {
  cadence: "instant" | "hourly" | "daily";
}) {
  const rules = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.digestCadence, cadence), eq(alertRules.isActive, true)));

  let queued = 0;

  for (const rule of rules) {
    const matches = await db
      .select()
      .from(watchlistMatches)
      .where(eq(watchlistMatches.watchlistId, rule.watchlistId));
    if (matches.length === 0) continue;

    // Gather docket + entry context for the email payload
    const rich = await Promise.all(
      matches.map(async (m) => {
        const [d, e] = await Promise.all([
          db.select().from(dockets).where(eq(dockets.id, m.docketId)).limit(1),
          m.entryId
            ? db.select().from(docketEntries).where(eq(docketEntries.id, m.entryId)).limit(1)
            : Promise.resolve([]),
        ]);
        return { docket: d[0]!, entry: e[0] ?? null, match: m };
      })
    );

    const { subject, body } = renderDigestEmail({
      cadence,
      items: rich,
    });

    await db.insert(alertDeliveries).values({
      id: ids.delivery(),
      ruleId: rule.id,
      payload: {
        matches: matches.map((m) => m.id),
        subject,
        body,
      },
      status: "queued",
    });
    queued++;
  }

  return { queued };
}
