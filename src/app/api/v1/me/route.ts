import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, orgs } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/me
 *
 *  Returns metadata about the API key in the Authorization header. Useful for
 *  any client that wants to confirm "yes this token works + here's its plan
 *  + here's the rate-limit headroom" before doing real work. Standard
 *  endpoint every API has — we didn't, until now.
 *
 *  Rate-limit numbers are returned as the per-plan ceilings rather than
 *  live usage counters (which we don't track yet); future versions will
 *  return `remaining` once we wire a token-bucket meter into auth.
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

  // Fetch a little more context for display purposes.
  const [keyRow] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, auth.keyId))
    .limit(1);
  const [orgRow] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.id, auth.orgId))
    .limit(1);

  const limits = PLAN_LIMITS[auth.plan] ?? PLAN_LIMITS.free;

  return ok(
    {
      key: {
        id: auth.keyId,
        name: keyRow?.name ?? null,
        token_prefix: keyRow?.tokenPrefix ?? null,
        scopes: auth.scopes,
        last_used_at: keyRow?.lastUsedAt
          ? keyRow.lastUsedAt.toISOString()
          : null,
        created_at: keyRow?.createdAt
          ? keyRow.createdAt.toISOString()
          : null,
      },
      org: {
        id: auth.orgId,
        name: orgRow?.name ?? null,
        slug: orgRow?.slug ?? null,
        plan: auth.plan,
      },
      limits: {
        per_second: limits.perSecond,
        per_hour: limits.perHour,
        per_day: limits.perDay,
        note: "Hard ceilings. Live remaining-counts will appear here once the token-bucket meter ships.",
      },
      docs: "https://docketlens.ai/docs/api-reference",
    },
    { headers: { "cache-control": "private, max-age=30" } }
  );
}
