import { type NextRequest } from "next/server";
import { renderAtom } from "@/lib/atom";
import { runSearch, describeQuery, type SearchQuery } from "@/lib/search/filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/saved-searches/{id}/feed.atom
 *      ?q=…&court=…&nos=…&scope=…&name=…&limit=…
 *
 *  Atom 1.0 sibling of /feed.xml. Same query params, same results — only the
 *  envelope differs. Some readers (Inoreader categories, Kagi labels,
 *  Reeder 5 smart folders) prefer Atom for richer per-entry metadata
 *  (`updated`, structured `author`, namespaced categories).
 *
 *  See /feed.xml/route.ts for the auth + caching + privacy notes; they
 *  apply identically here.
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

  const xml = renderAtom(
    {
      title: `DocketLens — ${name}`,
      siteUrl: `${SITE}/search`,
      feedUrl: `${SITE}${req.nextUrl.pathname}${req.nextUrl.search}`,
      id: `docketlens:saved/${id}`,
      subtitle: `Federal court filings matching: ${describeQuery(query)}.`,
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
        id: `docketlens:saved/${id}:${d.id}`,
        title: `${d.court} · ${d.caseName}`,
        link: docketUrl,
        published: `${d.filed}T12:00:00Z`,
        updated: topEntry ? `${topEntry.dateFiled}T12:00:00Z` : `${d.filed}T12:00:00Z`,
        summary: lines.join(" — "),
        categories: d.tags,
      };
    })
  );

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-robots-tag": "noindex",
      "access-control-allow-origin": "*",
    },
  });
}
