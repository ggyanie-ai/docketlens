import { type NextRequest } from "next/server";
import { renderJsonFeed } from "@/lib/jsonfeed";
import { runSearch, describeQuery, type SearchQuery } from "@/lib/search/filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/saved-searches/{id}/feed.json
 *      ?q=…&court=…&nos=…&scope=…&name=…&limit=…
 *
 *  JSON Feed 1.1 (https://jsonfeed.org/version/1.1) sibling of /feed.xml.
 *  Same query params, same results — JSON envelope instead of XML.
 *  Sidesteps XML escaping bugs entirely; supported natively by Reeder 5,
 *  NetNewsWire 6+, Inoreader.
 *
 *  See /feed.xml/route.ts for the auth + caching + privacy notes.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

function clampLimit(raw: string | null): number {
  const n = raw ? Number(raw) : 20;
  if (!Number.isFinite(n)) return 20;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;

  const query: SearchQuery = {
    q: sp.get("q"),
    court: sp.get("court"),
    nos: sp.get("nos"),
    scope: sp.get("scope"),
  };
  const name = sp.get("name")?.trim() || "Saved search";
  const limit = clampLimit(sp.get("limit"));

  const dockets = runSearch(query).slice(0, limit);

  const feed = renderJsonFeed(
    {
      title: `DocketLens — ${name}`,
      homepage: `${SITE}/search`,
      feedUrl: `${SITE}${req.nextUrl.pathname}${req.nextUrl.search}`,
      description: `Federal court filings matching: ${describeQuery(query)}.`,
      language: "en-US",
      author: { name: "DocketLens", url: SITE },
    },
    dockets.map((d) => {
      const docketUrl = `${SITE}/demo/${d.id}`;
      const topEntry = [...d.entries].sort((a, b) =>
        b.dateFiled.localeCompare(a.dateFiled)
      )[0];
      const lines = [
        `${d.court} · ${d.caseNumber} · ${d.natureOfSuit}`,
        `Filed ${d.filed} · Judge ${d.judge}`,
        topEntry
          ? `${topEntry.type}: ${topEntry.summaryOne ?? topEntry.short}`
          : "",
      ].filter(Boolean);
      return {
        id: `docketlens:saved/${id}:${d.id}`,
        url: docketUrl,
        title: `${d.court} · ${d.caseName}`,
        content_text: lines.join(" — "),
        summary: lines.join(" — "),
        date_published: `${d.filed}T12:00:00.000Z`,
        date_modified: topEntry
          ? `${topEntry.dateFiled}T12:00:00.000Z`
          : `${d.filed}T12:00:00.000Z`,
        tags: d.tags,
      };
    })
  );

  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-robots-tag": "noindex",
      "access-control-allow-origin": "*",
    },
  });
}
