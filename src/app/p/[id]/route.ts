import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /p/{id}
 *
 *  Short-URL redirect. Pastes into tweets / Slack / SMS more cleanly than
 *  `/watchlists/wl_abc123/preview`.
 *
 *  Today the only public-preview surface is per-watchlist, so we route every
 *  /p/{id} to /watchlists/{id}/preview. If we add other shareable read-only
 *  surfaces later (per-saved-search, per-docket bundle), this handler
 *  branches on the id prefix:
 *    wl_…   → /watchlists/{id}/preview
 *    srch_… → /search-shares/{id}
 *    etc.
 *
 *  Uses a 302 (not 301) so the underlying path can change without baking
 *  the redirect into the user's history forever.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.redirect(new URL("/", req.url), 302);

  // Pick the target route from the id prefix.
  let target: string;
  if (id.startsWith("wl_")) {
    target = `/watchlists/${encodeURIComponent(id)}/preview`;
  } else if (id.startsWith("dkt_")) {
    target = `/demo/${encodeURIComponent(id)}`;
  } else {
    // Unknown prefix — fall back to home rather than 404 inside the short
    // path. /p/* is for sharing; a graceful fallback beats a dead link.
    target = "/";
  }

  return NextResponse.redirect(new URL(target, SITE), 302);
}
