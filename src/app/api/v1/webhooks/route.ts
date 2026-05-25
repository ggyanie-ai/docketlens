import { type NextRequest } from "next/server";
import { desc, eq, and, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { alertDeliveries, alertRules, watchlists } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/webhooks
 *
 *  Returns the calling org's webhook delivery channels along with a
 *  last-24h success-rate summary. Pairs with the WebhookDeliveries
 *  table on /alerts (which renders a richer per-attempt view).
 *
 *  alertRules is keyed to a watchlist, not directly to an org. We
 *  resolve org scope by joining through watchlists.orgId.
 *
 *  Auth required; no plan gate (read-only).
 * ==========================================================================*/

interface WebhookSummary {
  rule_id: string;
  watchlist_id: string;
  target: string;
  digest_cadence: "instant" | "hourly" | "daily";
  is_active: boolean;
  last_24h: {
    total: number;
    sent: number;
    failed: number;
    queued: number;
    skipped: number;
    success_rate: number; // 0..1
  };
}

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  // 1) Collect every webhook rule whose watchlist belongs to this org.
  //    Single INNER JOIN keeps it cheap.
  const rows = await db
    .select({
      ruleId: alertRules.id,
      watchlistId: alertRules.watchlistId,
      target: alertRules.target,
      digestCadence: alertRules.digestCadence,
      isActive: alertRules.isActive,
    })
    .from(alertRules)
    .innerJoin(watchlists, eq(watchlists.id, alertRules.watchlistId))
    .where(
      and(
        eq(watchlists.orgId, auth.orgId),
        eq(alertRules.channel, "webhook")
      )
    );

  if (rows.length === 0) {
    return ok({ count: 0, webhooks: [] as WebhookSummary[] });
  }

  // 2) Pull last-24h deliveries for those rules in one query.
  const ruleIds = rows.map((r) => r.ruleId);
  const since = new Date(Date.now() - 86_400_000);
  const deliveries = await db
    .select()
    .from(alertDeliveries)
    .where(
      and(
        inArray(alertDeliveries.ruleId, ruleIds),
        gte(alertDeliveries.createdAt, since)
      )
    )
    .orderBy(desc(alertDeliveries.createdAt));

  // 3) Aggregate per-rule
  const summaries: WebhookSummary[] = rows.map((r) => {
    const own = deliveries.filter((d) => d.ruleId === r.ruleId);
    const total = own.length;
    const sent = own.filter((d) => d.status === "sent").length;
    const failed = own.filter((d) => d.status === "failed").length;
    const queued = own.filter((d) => d.status === "queued").length;
    const skipped = own.filter((d) => d.status === "skipped").length;
    const success_rate = total > 0 ? sent / total : 1;

    return {
      rule_id: r.ruleId,
      watchlist_id: r.watchlistId,
      target: r.target,
      digest_cadence: r.digestCadence,
      is_active: r.isActive,
      last_24h: { total, sent, failed, queued, skipped, success_rate },
    };
  });

  return ok({ count: summaries.length, webhooks: summaries });
}
