/* ============================================================================
 *  Widget impression counter — privacy-preserving aggregate counts.
 *
 *  Stored in a small `widget_pings` table:
 *      (docket_id TEXT, day TEXT, count INTEGER, PRIMARY KEY (docket_id, day))
 *
 *  We intentionally store NOTHING but the daily count per docket:
 *   - no IP address
 *   - no user-agent
 *   - no referrer
 *   - no session / cookie / fingerprint
 *
 *  The table is created lazily on first import (CREATE TABLE IF NOT EXISTS),
 *  not via the Drizzle schema/migration pipeline — because there's nothing to
 *  migrate forward and we'd rather not couple a side-table to user-data
 *  migrations. If/when the model grows (per-host buckets, etc.) we'll fold it
 *  into Drizzle proper.
 * ==========================================================================*/

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

let initialized = false;

async function ensureTable() {
  if (initialized) return;
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS widget_pings (
      docket_id TEXT NOT NULL,
      day       TEXT NOT NULL,
      count     INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (docket_id, day)
    )
  `);
  initialized = true;
}

function utcDay(d: Date = new Date()): string {
  // YYYY-MM-DD in UTC. Stable across timezones, daylight-saving safe.
  return d.toISOString().slice(0, 10);
}

/**
 * Increment the count for one docket / today. Idempotent at the row level —
 * concurrent inserts merge into the same row via ON CONFLICT.
 */
export async function recordWidgetImpression(docketId: string): Promise<void> {
  await ensureTable();
  const day = utcDay();
  await db.run(sql`
    INSERT INTO widget_pings (docket_id, day, count)
    VALUES (${docketId}, ${day}, 1)
    ON CONFLICT(docket_id, day) DO UPDATE SET count = count + 1
  `);
}

/**
 * Aggregate stats for one docket over the last `days` days (inclusive of today).
 * Returns `[{ day: 'YYYY-MM-DD', count }, …]` newest-first, gaps omitted.
 */
export async function widgetStats(
  docketId: string,
  days = 7
): Promise<{ day: string; count: number }[]> {
  await ensureTable();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  const cutoffDay = utcDay(cutoff);
  const rows = await db.all<{ day: string; count: number }>(sql`
    SELECT day, count FROM widget_pings
    WHERE docket_id = ${docketId} AND day >= ${cutoffDay}
    ORDER BY day DESC
  `);
  return rows;
}

/**
 * Top N dockets by impressions in the last `days` days. Returns
 * `[{ docketId, total }, …]` highest-first. Used by the dashboard
 * "your embeds" card.
 */
export async function widgetTopDockets(
  days = 7,
  limit = 5
): Promise<{ docketId: string; total: number }[]> {
  await ensureTable();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  const cutoffDay = utcDay(cutoff);
  const rows = await db.all<{ docket_id: string; total: number }>(sql`
    SELECT docket_id, SUM(count) AS total FROM widget_pings
    WHERE day >= ${cutoffDay}
    GROUP BY docket_id
    ORDER BY total DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => ({ docketId: r.docket_id, total: Number(r.total) }));
}

/** Grand total across all dockets in the window. Cheap aggregate for ops dashboards. */
export async function widgetTotal(days = 30): Promise<number> {
  await ensureTable();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
  const cutoffDay = utcDay(cutoff);
  const rows = await db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(count), 0) AS total FROM widget_pings
    WHERE day >= ${cutoffDay}
  `);
  return rows[0]?.total ?? 0;
}
