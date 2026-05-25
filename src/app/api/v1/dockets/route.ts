import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dockets } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { desc, like, and, eq, gte, lte } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(
    Math.max(Number(sp.get("limit") ?? "20") || 20, 1),
    100
  );
  const court = sp.get("court");
  const q = sp.get("q");
  const nos = sp.get("nos");        // Nature-of-Suit code prefix (e.g. "830")
  const dateFrom = sp.get("date_from"); // ISO YYYY-MM-DD
  const dateTo = sp.get("date_to");     // ISO YYYY-MM-DD

  const conds = [];
  if (court) conds.push(eq(dockets.court, court));
  if (q) conds.push(like(dockets.caseName, `%${q}%`));
  if (nos) conds.push(like(dockets.natureOfSuit, `${nos}%`));
  if (dateFrom) {
    const t = new Date(`${dateFrom}T00:00:00Z`);
    if (!Number.isNaN(t.getTime())) conds.push(gte(dockets.dateFiled, t));
  }
  if (dateTo) {
    const t = new Date(`${dateTo}T23:59:59Z`);
    if (!Number.isNaN(t.getTime())) conds.push(lte(dockets.dateFiled, t));
  }

  const rows = await db
    .select()
    .from(dockets)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(dockets.dateFiled))
    .limit(limit);

  // Hint headers so clients can self-pace before the live token-bucket meter
  // ships. Values mirror the per-plan ceilings in /api/v1/me — `remaining`
  // is currently equal to `limit` (no per-request counter yet). The reset
  // is a fixed UTC midnight for the day ceiling.
  const PLAN_LIMITS: Record<string, { perHour: number; perDay: number }> = {
    free: { perHour: 60, perDay: 1000 },
    pro: { perHour: 500, perDay: 10000 },
    team: { perHour: 1000, perDay: 50000 },
    enterprise: { perHour: 5000, perDay: 250000 },
  };
  const lim = PLAN_LIMITS[auth.plan] ?? PLAN_LIMITS.free;
  const tomorrowUtc = new Date();
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
  tomorrowUtc.setUTCHours(0, 0, 0, 0);

  return ok(
    rows.map((d) => ({
      id: d.id,
      court: d.court,
      case_name: d.caseName,
      docket_number: d.docketNumber,
      nature_of_suit: d.natureOfSuit,
      date_filed: d.dateFiled?.toISOString().slice(0, 10) ?? null,
      assigned_to: d.assignedTo,
    })),
    {
      headers: {
        "x-ratelimit-limit": String(lim.perDay),
        "x-ratelimit-remaining": String(lim.perDay),
        "x-ratelimit-reset": String(Math.floor(tomorrowUtc.getTime() / 1000)),
      },
    }
  );
}
