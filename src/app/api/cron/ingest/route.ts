import { type NextRequest, NextResponse } from "next/server";
import { runIngest } from "@/lib/ingest/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* ============================================================================
 *  GET /api/cron/ingest — Vercel Cron entry point
 *
 *  Scheduled hourly via vercel.json. Vercel sends the request with:
 *    Authorization: Bearer <CRON_SECRET>
 *  When CRON_SECRET is unset we still 401 manual hits — the only path to
 *  bypass auth is to run scripts/ingest.ts locally with the CourtListener
 *  token in your shell.
 *
 *  The cron is intentionally cheap (limit=50 dockets, 24h window). A
 *  full backfill is a separate flow.
 * ==========================================================================*/

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.replace(/^Bearer\s+/i, "").trim();
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    // Daily cron (Vercel Hobby cap) — sweep last 24h, larger limit
    // than the previous hourly default since this is the only run/day.
    const stats = await runIngest({ since: "24h", limitDockets: 200 });
    return NextResponse.json(stats, {
      status: stats.ok ? 200 : 207,
      headers: { "cache-control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
