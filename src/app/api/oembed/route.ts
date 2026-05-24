import { type NextRequest } from "next/server";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/oembed?url=<docket-url>[&format=json|xml][&maxwidth=…][&maxheight=…]
 *
 *  oEmbed 1.0 discovery endpoint — https://oembed.com.
 *
 *  Consumers that have oEmbed support (Notion, Ghost, WordPress, Slack
 *  unfurls, Discord, Roam, Obsidian) can paste a `docketlens.ai/demo/dkt_…`
 *  link and have it automatically expand into our embeddable widget.
 *
 *  Provider URL scheme registered (when we go live):
 *    https://docketlens.ai/demo/{docket_id}
 *
 *  Response shape: `type: "rich"` with an `html` payload that is an
 *  <iframe> pointing at /widget/{id}.
 *
 *  Notes:
 *   - Only `format=json` is implemented in this rev. `format=xml` returns
 *     501 — most modern consumers default to JSON, and we'd rather emit a
 *     clean failure than malformed XML.
 *   - `maxwidth` / `maxheight` are honored within the widget's natural
 *     bounds (560 × 420). The iframe scales down but never up.
 *   - Returns 404 for unknown docket ids and 400 for missing `url`.
 *   - CORS-open so client-side unfurlers can hit it.
 * ==========================================================================*/

const PROVIDER = {
  name: "DocketLens",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai",
};

const WIDGET_W = 560;
const WIDGET_H = 420;

function extractDocketId(input: string): string | null {
  // Accept either a full URL or a bare slug. Match /demo/dkt_… or /widget/dkt_….
  try {
    const u = new URL(input);
    const m = u.pathname.match(/\/(?:demo|widget)\/(dkt_[A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  } catch {
    const m = input.match(/^(dkt_[A-Za-z0-9_-]+)$/);
    return m ? m[1] : null;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      ...(init.headers ?? {}),
    },
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const url = sp.get("url")?.trim();
  if (!url) {
    return json({ error: "missing 'url' parameter" }, { status: 400 });
  }

  const format = (sp.get("format") ?? "json").toLowerCase();
  if (format === "xml") {
    // Spec-compliant fallback per https://oembed.com#section2.3.4.4
    return new Response("oEmbed XML format not supported", {
      status: 501,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (format !== "json") {
    return json({ error: `unsupported format '${format}'` }, { status: 400 });
  }

  const id = extractDocketId(url);
  if (!id) {
    return json({ error: "url does not match a DocketLens docket" }, { status: 404 });
  }

  const docket = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!docket) {
    return json({ error: "docket not found" }, { status: 404 });
  }

  const maxwidth = sp.get("maxwidth") ? Number(sp.get("maxwidth")) : WIDGET_W;
  const maxheight = sp.get("maxheight") ? Number(sp.get("maxheight")) : WIDGET_H;
  const width = clamp(Number.isFinite(maxwidth) ? maxwidth : WIDGET_W, 320, WIDGET_W);
  const height = clamp(Number.isFinite(maxheight) ? maxheight : WIDGET_H, 240, WIDGET_H);

  const widgetUrl = `${PROVIDER.url}/widget/${docket.id}`;
  const html =
    `<iframe src="${widgetUrl}" width="${width}" height="${height}" ` +
    `loading="lazy" referrerpolicy="no-referrer-when-downgrade" ` +
    `title="${escapeAttr(docket.caseName)}" ` +
    `style="border:0;border-radius:12px;max-width:100%;" allowfullscreen></iframe>`;

  return json({
    version: "1.0",
    type: "rich",
    title: docket.caseName,
    author_name: docket.court,
    author_url: `${PROVIDER.url}/jurisdictions`,
    provider_name: PROVIDER.name,
    provider_url: PROVIDER.url,
    cache_age: 3600,
    html,
    width,
    height,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "86400",
    },
  });
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
