import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return ok({
    name: "DocketLens REST API",
    version: "v1",
    docs: "https://docketlens.ai/docs/api",
    auth: "Bearer dkl_live_…",
    endpoints: [
      { method: "GET",  path: "/api/v1/dockets",         desc: "List recent dockets" },
      { method: "GET",  path: "/api/v1/dockets/:id",     desc: "Get one docket with entries + parties" },
      { method: "GET",  path: "/api/v1/search?q=",       desc: "Search cases by name / party / docket number" },
      { method: "GET",  path: "/api/v1/watchlists",      desc: "List org watchlists" },
      { method: "POST", path: "/api/v1/watchlists",      desc: "Create a watchlist (Team plan)" },
    ],
  });
}
