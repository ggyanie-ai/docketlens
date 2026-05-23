import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dockets, docketEntries, parties } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const docket = (await db.select().from(dockets).where(eq(dockets.id, id)).limit(1))[0];
  if (!docket) return err("not found", 404);

  const [entries, partyRows] = await Promise.all([
    db.select().from(docketEntries).where(eq(docketEntries.docketId, id)),
    db.select().from(parties).where(eq(parties.docketId, id)),
  ]);

  return ok({
    id: docket.id,
    court: docket.court,
    case_name: docket.caseName,
    docket_number: docket.docketNumber,
    nature_of_suit: docket.natureOfSuit,
    cause: docket.cause,
    jury_demand: docket.juryDemand,
    date_filed: docket.dateFiled?.toISOString().slice(0, 10) ?? null,
    assigned_to: docket.assignedTo,
    entries: entries.map((e) => ({
      id: e.id,
      entry_number: e.entryNumber,
      date_filed: e.dateFiled?.toISOString().slice(0, 10) ?? null,
      short_description: e.shortDescription,
      description: e.description,
    })),
    parties: partyRows.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
    })),
  });
}
