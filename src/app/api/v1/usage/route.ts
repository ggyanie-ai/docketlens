import { type NextRequest } from "next/server";
import { and, gte, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/usage
 *
 *  Per-key call-volume summary. Pairs with /api/v1/me — `/me` tells you
 *  *what* the key is + what the ceiling is; `/usage` tells you how close
 *  you are to that ceiling.
 *
 *  Today we don't have a request-counter sidecar (no per-key meter on
 *  every request). What we DO have is `lastUsedAt` per api_keys row,
 *  refreshed inside authenticateApiRequest. That lets us answer the most
 *  load-bearing question — "is this key being used?" — with high
 *  confidence, and we shape the response so consumers don't have to
 *  re-issue a request when we wire the live counter Tuesday.
 *
 *  Response shape contracts:
 *    used  → null when we don't track the dimension yet (today: all)
 *    limit → integer (per-plan ceiling from the same table /me uses)
 *
 *  Once the live counter ships:
 *    used.per_day / used.per_hour / used.per_minute go from null → int
 *    without any shape change.
 * ==========================================================================*/

const PLAN_LIMITS: Record<
  string,
  { perSecond: number; perHour: number; perDay: number }
> = {
  free: { perSecond: 1, perHour: 60, perDay: 1000 },
  pro: { perSecond: 3, perHour: 500, perDay: 10000 },
  team: { perSecond: 5, perHour: 1000, perDay: 50000 },
  enterprise: { perSecond: 20, perHour: 5000, perDay: 250000 },
};

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const limits = PLAN_LIMITS[auth.plan] ?? PLAN_LIMITS.free;

  // Touch-only window check: how many keys in this org have been used in
  // the last 24h? Crude but real. Once the per-request counter ships we
  // swap this for the bucketed counter without changing the shape.
  const yesterday = new Date(Date.now() - 86_400_000);
  const recent = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.orgId, auth.orgId),
        gte(apiKeys.lastUsedAt, yesterday)
      )
    );

  return ok(
    {
      key: { id: auth.keyId, plan: auth.plan },
      window_started_at: yesterday.toISOString(),
      window_ends_at: new Date().toISOString(),
      used: {
        per_minute: null,
        per_hour: null,
        per_day: null,
      },
      limit: {
        per_minute: limits.perSecond * 60,
        per_hour: limits.perHour,
        per_day: limits.perDay,
      },
      remaining: {
        per_minute: limits.perSecond * 60,
        per_hour: limits.perHour,
        per_day: limits.perDay,
      },
      org_keys_active_24h: recent.length,
      note:
        "Per-request usage counters land Tuesday with the token-bucket meter. Until then `used` fields are null and `remaining` equals `limit`.",
      docs: "https://docketlens.ai/docs/api-reference",
    },
    { headers: { "cache-control": "private, max-age=30" } }
  );
}
