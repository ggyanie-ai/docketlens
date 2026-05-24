import { type NextRequest } from "next/server";
import { recordWidgetImpression } from "@/lib/widget-pings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/widget-ping?id=dkt_…
 *
 *  Privacy-preserving 1×1 tracking pixel. The widget renders an
 *  `<img src="…/api/widget-ping?id=<docket>">` so every iframe load fires
 *  exactly one server-side hit.
 *
 *  What we record: docket_id + UTC day + count. That's it.
 *  What we DO NOT record: IP, user-agent, referrer, session, cookie, ETag.
 *  No cookies are set. No CORS preflight is needed.
 *
 *  Returns a 1×1 transparent GIF (43 bytes) with hard no-store headers so
 *  the browser fires the request every render.
 * ==========================================================================*/

// 43-byte transparent GIF — the smallest valid GIF89a. Base64 encoded so we
// can ship it as a tiny constant without a binary asset on disk.
const TRANSPARENT_GIF = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0)
);

function gifResponse(status = 200): Response {
  return new Response(TRANSPARENT_GIF as BodyInit, {
    status,
    headers: {
      "content-type": "image/gif",
      "content-length": String(TRANSPARENT_GIF.byteLength),
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
      expires: "0",
      // Privacy-forward: deny embedding tools from reading us cross-origin
      // beyond what they already do via the <img> tag.
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^dkt_[A-Za-z0-9_-]+$/.test(id)) {
    // Still return the pixel — never want a broken-image icon in the widget
    // because a caller fat-fingered the id. The 4xx is informational only.
    return gifResponse(400);
  }

  // Fire-and-forget — never block the pixel response on the write. If the DB
  // is briefly unavailable we drop the count silently rather than fail the
  // widget render.
  recordWidgetImpression(id).catch(() => {
    /* swallow — ops will see it in app logs */
  });

  return gifResponse(200);
}
