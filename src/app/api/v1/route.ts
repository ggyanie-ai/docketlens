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
      { method: "GET",  path: "/api/v1/courts",          desc: "List CourtListener-mirrored courts we cache" },
      { method: "GET",  path: "/api/v1/dockets",         desc: "List recent dockets" },
      { method: "GET",  path: "/api/v1/dockets/:id",     desc: "Get one docket with entries + parties" },
      { method: "GET",  path: "/api/v1/dockets/:id/ai-summaries", desc: "Extractive AI summaries (tier-gated)" },
      { method: "GET",  path: "/api/v1/search?q=",       desc: "Search cases by name / party / docket number" },
      { method: "GET",  path: "/api/v1/watchlists",      desc: "List org watchlists" },
      { method: "POST", path: "/api/v1/watchlists",      desc: "Create a watchlist (Team plan)" },
      { method: "GET",  path: "/api/v1/openapi.json",    desc: "OpenAPI 3.1 spec for this API" },
      { method: "GET",  path: "/api/health",             desc: "Liveness probe (no auth)" },
      { method: "GET",  path: "/api/widget-stats?id=",   desc: "Widget impression daily series (aggregate, auth required)" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.xml", desc: "RSS 2.0 feed of matches for a saved search" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.atom", desc: "Atom 1.0 sibling of the saved-search feed" },
      { method: "GET",  path: "/api/v1/saved-searches/:id/feed.json", desc: "JSON Feed 1.1 sibling of the saved-search feed" },
    ],
  });
}
