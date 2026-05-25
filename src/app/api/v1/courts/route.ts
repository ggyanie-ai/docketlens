import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { courts } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/courts
 *
 *  Returns every CourtListener-mirrored court we have in our local cache.
 *  Lets API consumers populate filter dropdowns without scraping the
 *  /jurisdictions page.
 *
 *  Query params:
 *    ?in_use=true|false   filter by whether the court is currently active
 *    ?jurisdiction=F|FB|FS|FD   filter by jurisdiction code
 *    ?limit=…   max rows (default 200, cap 500)
 *
 *  Bearer auth required (same as the rest of v1).
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const sp = req.nextUrl.searchParams;
  const inUseParam = sp.get("in_use");
  const jurisdiction = sp.get("jurisdiction")?.trim();
  const limitRaw = Number(sp.get("limit") ?? "200");
  const limit = Math.min(
    500,
    Math.max(1, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 200)
  );

  const conds = [] as Parameters<typeof db.select>[0] extends never
    ? never
    : ReturnType<typeof eq>[];
  if (inUseParam === "true") conds.push(eq(courts.inUse, true));
  else if (inUseParam === "false") conds.push(eq(courts.inUse, false));
  if (jurisdiction) conds.push(eq(courts.jurisdiction, jurisdiction));

  const rows = await db
    .select()
    .from(courts)
    .where(conds.length === 1 ? conds[0] : undefined)
    .orderBy(asc(courts.id))
    .limit(limit);

  return ok(
    {
      courts: rows.map((c) => ({
        id: c.id,
        full_name: c.fullName,
        short_name: c.shortName,
        jurisdiction: c.jurisdiction,
        citation_string: c.citationString,
        in_use: c.inUse,
      })),
      count: rows.length,
      meta: {
        limit,
        filters: {
          in_use: inUseParam === null ? null : inUseParam === "true",
          jurisdiction: jurisdiction ?? null,
        },
        // Light schema hint so consumers know the jurisdiction enum.
        jurisdiction_codes: {
          F: "Federal District",
          FB: "Federal Bankruptcy",
          FS: "Federal Special",
          FD: "Federal Appellate",
        },
      },
    },
    { headers: { "cache-control": "public, max-age=300, stale-while-revalidate=3600" } }
  );
}
