import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dockets, docketEntries } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/dockets/{id}/entries
 *
 *  Narrow shape — just the entries — for consumers that render a timeline
 *  but don't need party info. Pairs with /api/v1/dockets/{id}/parties.
 *
 *  Query params:
 *    ?limit=… (default 100, cap 500) — newest-first slice
 *    ?since=YYYY-MM-DD — only entries filed on/after the date
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const limitRaw = Number(sp.get("limit") ?? "100");
  const limit = Math.min(
    500,
    Math.max(1, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 100)
  );
  const since = sp.get("since");
  const sinceMs = since ? new Date(since + "T00:00:00Z").getTime() : null;

  const dbDocket = (
    await db.select().from(dockets).where(eq(dockets.id, id)).limit(1)
  )[0];
  const sample = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!dbDocket && !sample) return err("docket not found", 404);

  if (dbDocket) {
    const rows = await db
      .select()
      .from(docketEntries)
      .where(eq(docketEntries.docketId, id));
    const filtered = rows
      .filter((e) => {
        if (!sinceMs) return true;
        const t = e.dateFiled?.getTime() ?? 0;
        return t >= sinceMs;
      })
      .sort(
        (a, b) =>
          (b.dateFiled?.getTime() ?? 0) - (a.dateFiled?.getTime() ?? 0)
      )
      .slice(0, limit);
    return ok({
      docket_id: id,
      count: filtered.length,
      entries: filtered.map((e) => ({
        id: e.id,
        entry_number: e.entryNumber,
        date_filed: e.dateFiled?.toISOString().slice(0, 10) ?? null,
        short_description: e.shortDescription,
        description: e.description,
      })),
    });
  }
  // sample fallback
  const sorted = [...sample!.entries]
    .filter((e) => {
      if (!sinceMs) return true;
      return new Date(e.dateFiled).getTime() >= sinceMs;
    })
    .sort((a, b) => b.dateFiled.localeCompare(a.dateFiled))
    .slice(0, limit);
  return ok({
    docket_id: id,
    count: sorted.length,
    entries: sorted.map((e) => ({
      id: e.id,
      entry_number: e.entryNumber,
      date_filed: e.dateFiled,
      short_description: e.short,
      description: e.description,
    })),
  });
}
