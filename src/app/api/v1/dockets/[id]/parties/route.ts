import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dockets, parties } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/dockets/{id}/parties
 *
 *  Narrow shape — just the party list — for consumers that don't need the
 *  full docket envelope. Pairs with /api/v1/dockets/{id}/entries.
 *
 *  The combined `/api/v1/dockets/{id}` remains the convenience default;
 *  these two siblings exist so a UI that only renders a party graph (or
 *  only a timeline) can skip half the payload.
 *
 *  Source resolution mirrors /ai-summaries — DB first, fall back to the
 *  seeded SAMPLE_DOCKETS for the canonical demo cases so the endpoint
 *  isn't empty before the ingest worker runs.
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
  const dbDocket = (
    await db.select().from(dockets).where(eq(dockets.id, id)).limit(1)
  )[0];
  const sample = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!dbDocket && !sample) return err("docket not found", 404);

  if (dbDocket) {
    const rows = await db
      .select()
      .from(parties)
      .where(eq(parties.docketId, id));
    return ok({
      docket_id: id,
      count: rows.length,
      parties: rows.map((p) => ({ id: p.id, name: p.name, role: p.role })),
    });
  }
  // sample fallback
  return ok({
    docket_id: id,
    count: sample!.parties.length,
    parties: sample!.parties.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role.toLowerCase(),
    })),
  });
}
