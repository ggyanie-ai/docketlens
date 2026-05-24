import { type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
// `force-dynamic` (not force-static) because we need per-request If-None-Match
// handling. CDN-level caching is still served by the cache-control header.
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /widget/{id}/json
 *
 *  Data-only twin of the iframe widget at /widget/{id}. Same shape the HTML
 *  widget renders, returned as JSON so consumers can build their own card
 *  without scraping the rendered page.
 *
 *  Cache contract:
 *   - Strong ETag derived from (docket id + entries fingerprint), so when a
 *     new entry lands the ETag changes and proxies revalidate.
 *   - Cache-control: `public, max-age=300, stale-while-revalidate=86400` —
 *     identical to the iframe widget so they refresh in lockstep.
 *   - Honors `If-None-Match` and returns 304 with no body.
 *
 *  CORS-open so client-side renderers (Notion, Ghost custom blocks, blog
 *  components) can hit it directly.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

function buildPayload(id: string) {
  const d = SAMPLE_DOCKETS.find((x) => x.id === id);
  if (!d) return null;

  const recent = [...d.entries]
    .sort((a, b) => b.dateFiled.localeCompare(a.dateFiled))
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      entry_number: e.entryNumber,
      date_filed: e.dateFiled,
      type: e.type,
      short_description: e.short,
    }));

  return {
    id: d.id,
    case_name: d.caseName,
    case_name_short: d.caseNameShort,
    court: d.court,
    court_full: d.courtFull,
    case_number: d.caseNumber,
    docket_number: d.caseNumber,
    nature_of_suit: d.natureOfSuit,
    nature_of_suit_code: d.natureOfSuitCode,
    cause: d.cause,
    jury_demand: d.juryDemand,
    status: d.status,
    judge: d.judge,
    filed: d.filed,
    tags: d.tags,
    parties: d.parties.map((p) => ({ id: p.id, name: p.name, role: p.role })),
    recent_entries: recent,
    links: {
      widget: `${SITE}/widget/${d.id}`,
      canonical: `${SITE}/demo/${d.id}`,
      oembed: `${SITE}/api/oembed?url=${encodeURIComponent(
        `${SITE}/demo/${d.id}`
      )}&format=json`,
    },
    attribution: "Powered by DocketLens",
    provider: { name: "DocketLens", url: SITE },
    extractive_only: true,
  };
}

function etagFor(payload: object): string {
  const h = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("base64url")
    .slice(0, 24);
  // Strong ETag (no W/ prefix) — body is deterministic for given inputs.
  return `"${h}"`;
}

function notFound(): Response {
  return new Response(
    JSON.stringify({ error: "docket not found" }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60, stale-while-revalidate=300",
        "access-control-allow-origin": "*",
      },
    }
  );
}

const SHARED_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  // Widget pages set frame-ancestors via next.config; the JSON twin doesn't
  // need that header itself but inherits the same parent permissions.
  vary: "Accept-Encoding",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer-when-downgrade",
};

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const payload = buildPayload(id);
  if (!payload) return notFound();

  const etag = etagFor(payload);
  // NOTE: Next.js dev mode strips `if-none-match` from incoming requests to
  // force fresh responses during development — under `next dev` this branch
  // is unreachable. In production (`next start` / Vercel) the header passes
  // through and we honor it.
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        etag,
        "cache-control": "public, max-age=300, stale-while-revalidate=86400",
        ...SHARED_HEADERS,
      },
    });
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
      etag,
      ...SHARED_HEADERS,
    },
  });
}

export async function HEAD(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const payload = buildPayload(id);
  if (!payload) {
    return new Response(null, { status: 404, headers: SHARED_HEADERS });
  }
  const etag = etagFor(payload);
  return new Response(null, {
    status: 200,
    headers: {
      etag,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
      ...SHARED_HEADERS,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...SHARED_HEADERS,
      "access-control-allow-methods": "GET, HEAD, OPTIONS",
      "access-control-allow-headers": "If-None-Match",
      "access-control-max-age": "86400",
    },
  });
}
