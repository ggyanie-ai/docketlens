import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/health
 *
 *  Convenience alias. Many monitor configs assume `/v1/health` lives under
 *  the API root rather than at `/api/health`. 301 to the canonical so the
 *  redirect ends up in the user's stored URL, but we don't add a real
 *  handler — the canonical /api/health is the source of truth for both
 *  the payload shape and the DB ping.
 * ==========================================================================*/

export function GET() {
  return NextResponse.redirect(new URL("/api/health", "https://docketlens.ai"), 301);
}
