import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return ok({
    name: "DocketLens REST API",
    version: "v1",
    docs: "https://docketlens.ai/docs/api",
    auth: "Bearer dkl_live_…",
    openapi: "/api/v1/openapi.json",
    health: "/api/health",
    endpoints: [
      { method: "GET",  path: "/api/v1/me",              desc: "Caller identity + plan + rate-limit ceilings" },
      { method: "GET",  path: "/api/v1/usage",           desc: "Per-key call-volume vs. ceiling (counters land Tuesday)" },
      { method: "GET",  path: "/api/v1/courts",          desc: "List CourtListener-mirrored courts we cache" },
      { method: "GET",  path: "/api/v1/dockets",         desc: "List recent dockets" },
      { method: "GET",  path: "/api/v1/dockets/:id",     desc: "Get one docket with entries + parties" },
      { method: "GET",  path: "/api/v1/dockets/:id/parties", desc: "Narrow: parties only" },
      { method: "GET",  path: "/api/v1/dockets/:id/entries", desc: "Narrow: entries only (since/limit params)" },
      { method: "GET",  path: "/api/v1/dockets/:id/ai-summaries", desc: "Extractive AI summaries (tier-gated)" },
      { method: "POST", path: "/api/v1/dockets/:id/ai-summaries/refresh", desc: "Queue an on-demand summary regen (Pro+)" },
      { method: "GET",  path: "/api/v1/search?q=",       desc: "Search cases by name / party / docket number" },
      { method: "GET",  path: "/api/v1/watchlists",      desc: "List org watchlists" },
      { method: "POST", path: "/api/v1/watchlists",      desc: "Create a watchlist (Team plan)" },
      { method: "GET",  path: "/api/v1/watchlists/:id",  desc: "Get one watchlist" },
      { method: "PATCH", path: "/api/v1/watchlists/:id", desc: "Update a watchlist (Team plan)" },
      { method: "DELETE", path: "/api/v1/watchlists/:id", desc: "Soft-delete a watchlist (Team plan)" },
      { method: "GET",  path: "/api/v1/openapi.json",    desc: "OpenAPI 3.1 spec for this API" },
      { method: "GET",  path: "/api/health",             desc: "Liveness probe (no auth)" },
      { method: "GET",  path: "/api/widget-stats?id=",   desc: "Widget impression daily series (aggregate, auth required)" },
      { method: "GET",  path: "/api/v1/saved-searches",    desc: "List org saved searches" },
      { method: "POST", path: "/api/v1/saved-searches",    desc: "Create a saved search (Team plan)" },
      { method: "GET",  path: "/api/v1/saved-searches/:id", desc: "Get one saved search" },
      { method: "PATCH", path: "/api/v1/saved-searches/:id", desc: "Update a saved search (Team plan)" },
      { method: "DELETE", path: "/api/v1/saved-searches/:id", desc: "Delete a saved search (Team plan)" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.xml", desc: "RSS 2.0 feed of matches for a saved search" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.atom", desc: "Atom 1.0 sibling of the saved-search feed" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.json", desc: "JSON Feed 1.1 sibling of the saved-search feed" },
      { method: "GET",  path: "/api/v1/digest/preview",   desc: "Preview the next digest (?cadence=&format=)" },
    ],
  });
}

/**
 * `OPTIONS /api/v1` returns the same discovery payload as GET. Some
 * preflight-style discovery tools (Postman's API import, certain
 * compliance scanners) only fire OPTIONS; we'd rather give them the
 * payload than 404.
 */
export const OPTIONS = GET;
