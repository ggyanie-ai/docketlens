export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/health/db
 *
 *  Bare DB liveness probe. 200 with no body if `select 1` succeeds,
 *  503 if it doesn't. Useful for monitors that don't want to parse
 *  the /api/health JSON envelope — just check the status code.
 *
 *  Hard 1-second timeout (vs. /api/health's 2-second) so a stalled
 *  DB fails the check faster on this surface. No auth — public probe.
 *
 *  DB module is dynamically imported inside the handler — when
 *  DATABASE_URL points at a path libSQL can't open (e.g. serverless
 *  read-only filesystem), the throw is during import, not query.
 *  Static imports would crash module init and Next.js would emit a
 *  500 HTML page instead of our 503.
 * ==========================================================================*/

export async function GET() {
  const timeoutMs = 1_000;
  try {
    const [{ sql }, { db }] = await Promise.all([
      import("drizzle-orm"),
      import("@/lib/db"),
    ]);
    await Promise.race([
      (async () => db.run(sql`select 1`))(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db ping timeout")), timeoutMs)
      ),
    ]);
    return new Response(null, {
      status: 200,
      headers: {
        "cache-control": "no-store, max-age=0",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "cache-control": "no-store, max-age=0" },
    });
  }
}

export function HEAD() {
  return GET();
}
