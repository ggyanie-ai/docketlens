import { type NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { widgetTopDockets, widgetTotal } from "@/lib/widget-pings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/widget-pings/aggregate?days=30&limit=10
 *
 *  REST exposure of the rollup the /dashboard "your embeds" card uses.
 *  Lets embedders build their own analytics dashboards from the same
 *  privacy-preserving aggregate (docket × day × count).
 *
 *  Per the privacy promise in /api/widget-ping: nothing per-person is
 *  stored. The aggregate reads from `widget_pings` and groups by
 *  docket_id; the calling org boundary doesn't matter because all
 *  pings are public iframe loads.
 *
 *  Auth required. Any plan.
 *
 *  Query params:
 *    days  — window in days (1..90, default 30)
 *    limit — top-N dockets to return (1..50, default 10)
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const days = Math.min(
    Math.max(Number(sp.get("days") ?? "30") || 30, 1),
    90
  );
  const limit = Math.min(
    Math.max(Number(sp.get("limit") ?? "10") || 10, 1),
    50
  );

  const [top, total] = await Promise.all([
    widgetTopDockets(days, limit),
    widgetTotal(days),
  ]);

  return ok({
    window: { days },
    grand_total: total,
    top_dockets: top.map((t) => ({
      docket_id: t.docketId,
      count: t.total,
    })),
    note:
      "Aggregate impressions only. We store no IP, UA, referrer, cookie, or session per request. See /api/widget-ping for the recording side.",
  });
}
