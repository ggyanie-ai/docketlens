import { type NextRequest } from "next/server";
import { desc, eq, and, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/audit
 *
 *  Read endpoint for the org's audit log. Team plan only. Returns events
 *  newest-first, paginated via the standard `?before=<id>` cursor (or by
 *  occurredAt timestamp). The in-app /audit-log page will eventually call
 *  this once auth wires; programmatic consumers (SOC2 export jobs,
 *  IR dashboards) can call it today.
 *
 *  Query params:
 *    ?limit=…   (default 50, cap 200)
 *    ?action=…  prefix match (e.g. "watchlist." returns every watchlist
 *               event regardless of subaction)
 *    ?before_id=…  cursor id (newest-first means "before" = strictly older)
 *
 *  Sensitive columns (ip_address, user_agent) are returned only on Team+.
 *  We never strip them at the schema layer — the gate is here so we can
 *  relax it later for compliance-export use cases without a schema bump.
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan !== "team" && auth.plan !== "enterprise") {
    return err("upgrade required to read audit log (Team plan)", 402);
  }

  const sp = req.nextUrl.searchParams;
  const limitRaw = Number(sp.get("limit") ?? "50");
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 50, 1),
    200
  );
  const action = sp.get("action")?.trim();
  const beforeId = sp.get("before_id");

  // Get the cursor row if specified, so we can filter by occurredAt strict
  // less-than (id is a nanoid, not a sortable cursor).
  let cursorTs: Date | null = null;
  if (beforeId) {
    const row = (
      await db
        .select({ occurredAt: auditEvents.occurredAt })
        .from(auditEvents)
        .where(
          and(eq(auditEvents.id, beforeId), eq(auditEvents.orgId, auth.orgId))
        )
        .limit(1)
    )[0];
    if (row?.occurredAt) cursorTs = row.occurredAt;
  }

  const conds = [eq(auditEvents.orgId, auth.orgId)];
  if (cursorTs) conds.push(lt(auditEvents.occurredAt, cursorTs));

  // Fetch limit+1 to detect "more pages" without a count query
  const rows = await db
    .select()
    .from(auditEvents)
    .where(and(...conds))
    .orderBy(desc(auditEvents.occurredAt))
    .limit(limit + 1);

  // In-memory action-prefix filter — cheap given the limit cap of 200
  const filtered = action
    ? rows.filter((r) => r.action.startsWith(action))
    : rows;

  const hasMore = filtered.length > limit;
  const page = filtered.slice(0, limit);
  const nextBeforeId = hasMore ? page[page.length - 1]?.id ?? null : null;

  return ok({
    count: page.length,
    has_more: hasMore,
    next_before_id: nextBeforeId,
    events: page.map((e) => ({
      id: e.id,
      action: e.action,
      actor_user_id: e.userId,
      target: e.target,
      metadata: e.metadata,
      ip_address: e.ipAddress,
      user_agent: e.userAgent,
      occurred_at: e.occurredAt?.toISOString() ?? null,
    })),
  });
}
