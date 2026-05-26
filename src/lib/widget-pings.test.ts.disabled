import { describe, it, expect, beforeEach, vi } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

/* ============================================================================
 *  Tests for the widget-impression counter.
 *
 *  Uses an in-memory libSQL database (`:memory:`) wired through drizzle so
 *  the upsert + aggregate paths exercise the real SQL the production
 *  module emits. We `vi.mock("@/lib/db")` and swap in our fresh in-memory
 *  drizzle instance before importing the SUT.
 *
 *  Note on table-lifetime: widget-pings.ts has a module-level `initialized`
 *  flag that caches the "table exists" assertion. We do NOT drop+recreate
 *  the table between tests — instead we DELETE FROM to truncate. This
 *  mirrors how the module would behave in a long-lived process and avoids
 *  having to thread vi.resetModules through every spec.
 * ==========================================================================*/

const client = createClient({ url: ":memory:" });
const db = drizzle(client);

vi.mock("@/lib/db", () => ({ db }));

// Import after the mock is in place so the SUT picks up our db.
const { recordWidgetImpression, widgetStats, widgetTopDockets, widgetTotal } =
  await import("./widget-pings");

beforeEach(async () => {
  // Ensure table exists then truncate. Safe even if a prior test already
  // had the production module create it.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS widget_pings (
      docket_id TEXT NOT NULL,
      day       TEXT NOT NULL,
      count     INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (docket_id, day)
    )
  `);
  await client.execute("DELETE FROM widget_pings");
});

describe("recordWidgetImpression", () => {
  it("creates the row on first call (count=1)", async () => {
    await recordWidgetImpression("dkt_a");
    const r = await client.execute(
      "SELECT count FROM widget_pings WHERE docket_id = ?",
      ["dkt_a"]
    );
    expect(r.rows).toHaveLength(1);
    expect(Number(r.rows[0].count)).toBe(1);
  });

  it("upserts on second call for same docket+day (count=2)", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_a");
    const r = await client.execute(
      "SELECT count FROM widget_pings WHERE docket_id = ?",
      ["dkt_a"]
    );
    expect(r.rows).toHaveLength(1);
    expect(Number(r.rows[0].count)).toBe(2);
  });

  it("keeps separate counts per docket on the same day", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_b");
    await recordWidgetImpression("dkt_a");
    const r = await client.execute(
      "SELECT docket_id, count FROM widget_pings ORDER BY docket_id"
    );
    expect(r.rows).toHaveLength(2);
    expect(r.rows[0].docket_id).toBe("dkt_a");
    expect(Number(r.rows[0].count)).toBe(2);
    expect(r.rows[1].docket_id).toBe("dkt_b");
    expect(Number(r.rows[1].count)).toBe(1);
  });

  it("stores day as YYYY-MM-DD (UTC slice of today)", async () => {
    await recordWidgetImpression("dkt_a");
    const r = await client.execute(
      "SELECT day FROM widget_pings WHERE docket_id = ?",
      ["dkt_a"]
    );
    expect(r.rows[0].day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.rows[0].day).toBe(new Date().toISOString().slice(0, 10));
  });

  it("creates table lazily on first call (CREATE TABLE IF NOT EXISTS)", async () => {
    // Reset the module's internal `initialized` flag, drop the table, then
    // import a fresh copy of the SUT to prove the lazy CREATE path runs.
    vi.resetModules();
    await client.execute("DROP TABLE IF EXISTS widget_pings");
    const before = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='widget_pings'"
    );
    expect(before.rows).toHaveLength(0);

    const fresh = await import("./widget-pings");
    await fresh.recordWidgetImpression("dkt_lazy");

    const after = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='widget_pings'"
    );
    expect(after.rows).toHaveLength(1);
  });
});

describe("widgetStats", () => {
  it("returns empty array when no rows", async () => {
    const stats = await widgetStats("dkt_nonexistent", 7);
    expect(stats).toEqual([]);
  });

  it("returns today's count for the queried docket", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_a");
    const stats = await widgetStats("dkt_a", 7);
    expect(stats).toHaveLength(1);
    expect(stats[0].count).toBe(3);
    expect(stats[0].day).toBe(new Date().toISOString().slice(0, 10));
  });

  it("includes historical rows within window, newest-first", async () => {
    await recordWidgetImpression("dkt_a"); // create table + today=2

    // Seed two synthetic historical days that fall WITHIN a 7-day window.
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setUTCDate(fiveDaysAgo.getUTCDate() - 5);

    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_a", twoDaysAgo.toISOString().slice(0, 10), 7]
    );
    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_a", fiveDaysAgo.toISOString().slice(0, 10), 4]
    );

    const stats = await widgetStats("dkt_a", 7);
    expect(stats).toHaveLength(3);
    // newest-first: today > twoDaysAgo > fiveDaysAgo
    expect(stats[0].day > stats[1].day).toBe(true);
    expect(stats[1].day > stats[2].day).toBe(true);
    expect(stats.map((s) => s.count)).toEqual([1, 7, 4]);
  });

  it("excludes rows outside the day window", async () => {
    await recordWidgetImpression("dkt_a");

    // Seed a row 30 days ago — should be excluded from a 7-day window.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_a", thirtyDaysAgo.toISOString().slice(0, 10), 999]
    );

    const sevenDay = await widgetStats("dkt_a", 7);
    expect(sevenDay).toHaveLength(1);
    expect(sevenDay[0].count).toBe(1);

    const ninetyDay = await widgetStats("dkt_a", 90);
    expect(ninetyDay).toHaveLength(2);
  });

  it("default window is 7 days", async () => {
    await recordWidgetImpression("dkt_a");
    const stats = await widgetStats("dkt_a");
    expect(stats).toHaveLength(1);
  });

  it("does not leak rows from other dockets", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_b");
    const stats = await widgetStats("dkt_a", 7);
    expect(stats).toHaveLength(1);
  });
});

describe("widgetTopDockets", () => {
  it("returns top N by total, descending", async () => {
    // a=1, b=3, c=2
    await recordWidgetImpression("dkt_a");
    for (let i = 0; i < 3; i++) await recordWidgetImpression("dkt_b");
    for (let i = 0; i < 2; i++) await recordWidgetImpression("dkt_c");

    const top = await widgetTopDockets(7, 5);
    expect(top).toHaveLength(3);
    expect(top[0]).toEqual({ docketId: "dkt_b", total: 3 });
    expect(top[1]).toEqual({ docketId: "dkt_c", total: 2 });
    expect(top[2]).toEqual({ docketId: "dkt_a", total: 1 });
  });

  it("respects the limit", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_b");
    await recordWidgetImpression("dkt_c");
    const top = await widgetTopDockets(7, 2);
    expect(top).toHaveLength(2);
  });

  it("sums across multiple days within the window", async () => {
    await recordWidgetImpression("dkt_a"); // today=1
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_a", yesterday.toISOString().slice(0, 10), 10]
    );
    const top = await widgetTopDockets(7, 5);
    expect(top[0]).toEqual({ docketId: "dkt_a", total: 11 });
  });

  it("excludes rows outside the day window", async () => {
    await recordWidgetImpression("dkt_a");
    const oneYearAgo = new Date();
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 365);
    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_b", oneYearAgo.toISOString().slice(0, 10), 500]
    );
    const top = await widgetTopDockets(7, 5);
    expect(top.map((t) => t.docketId)).not.toContain("dkt_b");
  });

  it("returns empty when no impressions", async () => {
    // create the table
    await recordWidgetImpression("dkt_a");
    // delete everything
    await client.execute("DELETE FROM widget_pings");
    const top = await widgetTopDockets(7, 5);
    expect(top).toEqual([]);
  });
});

describe("widgetTotal", () => {
  it("returns 0 when there are no rows in window", async () => {
    // ensureTable runs; no rows.
    await recordWidgetImpression("dkt_seed");
    await client.execute("DELETE FROM widget_pings");
    const total = await widgetTotal(30);
    expect(total).toBe(0);
  });

  it("sums every row in the window across all dockets", async () => {
    await recordWidgetImpression("dkt_a");
    await recordWidgetImpression("dkt_b");
    await recordWidgetImpression("dkt_b");
    expect(await widgetTotal(30)).toBe(3);
  });

  it("ignores rows outside the window", async () => {
    await recordWidgetImpression("dkt_a"); // today, count=1
    const longAgo = new Date();
    longAgo.setUTCDate(longAgo.getUTCDate() - 60);
    await client.execute(
      "INSERT INTO widget_pings (docket_id, day, count) VALUES (?, ?, ?)",
      ["dkt_old", longAgo.toISOString().slice(0, 10), 999]
    );
    expect(await widgetTotal(7)).toBe(1);
    expect(await widgetTotal(90)).toBe(1000);
  });
});
