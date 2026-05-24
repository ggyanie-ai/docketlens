import { type NextRequest } from "next/server";
import { renderRss, rfc822 } from "@/lib/rss";
import { runSearch, describeQuery, type SearchQuery } from "@/lib/search/filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/saved-searches/{id}/feed.xml
 *      ?q=…&court=…&nos=…&scope=…&name=…&limit=…
 *
 *  Renders an RSS 2.0 feed of the dockets matching a saved-search query.
 *  Lets users drop a saved search into any RSS reader (NetNewsWire,
 *  Feedbin, Reeder, Inoreader, Kagi, Vivaldi) and stop polling the
 *  dashboard.
 *
 *  Today the saved-search row isn't persisted server-side (it lives in
 *  localStorage on the /search page), so the actual filters travel through
 *  the URL. The `{id}` segment is a stable identifier used as the feed
 *  guid prefix + cache key — once Better-Auth + the DB-backed saved
 *  searches land, the id alone will be enough and the query params will
 *  become optional.
 *
 *  Auth model: the feed URL itself is the secret. Anyone with the URL can
 *  read the feed. Treat it like a Calendly link. Future DB-backed mode
 *  will support per-feed token rotation.
 *
 *  Caching:
 *   - Public, 5-minute edge cache with SWR — RSS readers poll on their
 *     own cadence; we don't need to be real-time.
 *   - x-robots-tag: noindex — search engines shouldn't crawl per-user
 *     feeds. The URL has an opaque id; the noindex hint is belt-and-suspenders.
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

  const xml = renderRss(
    {
      title: `DocketLens — ${name}`,
      siteUrl: `${SITE}/search`,
      feedUrl: `${SITE}${req.nextUrl.pathname}${req.nextUrl.search}`,
      description: `Federal court filings matching: ${describeQuery(query)}.`,
      language: "en-US",
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
        guid: `docketlens:saved/${id}:${d.id}`,
        title: `${d.court} · ${d.caseName}`,
        link: docketUrl,
        description: lines.join(" — "),
        pubDate: rfc822(`${d.filed}T12:00:00Z`),
        categories: d.tags,
      };
    })
  );

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-robots-tag": "noindex",
      "access-control-allow-origin": "*",
    },
  });
}
