import { type NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { widgetStats, widgetTotal } from "@/lib/widget-pings";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/widget-stats?id=dkt_…[&days=7]
 *
 *  Read interface to the privacy-preserving impression counters captured by
 *  /api/widget-ping. Returns the daily series for one docket plus the total
 *  across the window — enough to answer "is anyone embedding this case?"
 *  without ever exposing per-person data.
 *
 *  Auth: any valid API key. We do require auth so randos can't scrape
 *  popularity rankings across our public corpus by enumerating docket IDs,
 *  but we don't gate by org-ownership yet — that requires a docket → org
 *  mapping (via watchlist matches) which we'll wire up alongside the
 *  Tuesday auth/Better-Auth pass. Documented as a v0 limitation in the
 *  response `meta.access_model = "any_authenticated"`.
 *
 *  Privacy promise carried over from the ping endpoint:
 *   - we store no IP, UA, referrer, cookie, or session per request
 *   - we surface only (docket_id, day, count) aggregates
 *
 *  Response shape:
 *    {
 *      ok: true,
 *      data: {
 *        docket: { id, case_name?, court? },
 *        window: { days, from, to },
 *        series: [{ day: "YYYY-MM-DD", count }, …],
 *        total: <integer>,
 *        meta: { access_model, privacy }
 *      }
 *    }
 * ==========================================================================*/

const MAX_DAYS = 30;

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const sp = req.nextUrl.searchParams;
  const id = sp.get("id")?.trim();
  if (!id) return err("missing 'id' parameter (dkt_…)", 400);
  if (!/^dkt_[A-Za-z0-9_-]+$/.test(id)) {
    return err("malformed docket id", 400);
  }

  const daysParam = sp.get("days");
  let days = daysParam ? Number(daysParam) : 7;
  if (!Number.isFinite(days) || days < 1) days = 7;
  if (days > MAX_DAYS) days = MAX_DAYS;

  // Best-effort enrichment with the human-readable name; absent for any
  // docket not in the demo seed (works fine, just leaves name/court null).
  const sample = SAMPLE_DOCKETS.find((d) => d.id === id);

  const [series, total] = await Promise.all([
    widgetStats(id, days),
    widgetTotal(days),
  ]);

  const seriesTotal = series.reduce((sum, row) => sum + row.count, 0);

  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  const utcDay = (d: Date) => d.toISOString().slice(0, 10);

  return ok(
    {
      docket: {
        id,
        case_name: sample?.caseName ?? null,
        court: sample?.court ?? null,
      },
      window: { days, from: utcDay(from), to: utcDay(today) },
      series,
      total: seriesTotal,
      grand_total_all_dockets: total,
      meta: {
        access_model: "any_authenticated" as const,
        privacy:
          "Aggregate counts only. No IP, user-agent, referrer, cookie, or session is stored per impression.",
        max_days: MAX_DAYS,
      },
    },
    {
      headers: {
        // Stats are read-only and per-org-private; short private cache only.
        "cache-control": "private, max-age=60",
      },
    }
  );
}
