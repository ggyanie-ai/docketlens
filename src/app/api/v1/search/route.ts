import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dockets, parties } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { desc, like, or, eq, and } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  if (!q) return err("query 'q' is required", 400);

  const court = sp.get("court");
  const limit = Math.min(Number(sp.get("limit") ?? "20"), 100);

  const partyRows = await db
    .select()
    .from(parties)
    .where(like(parties.nameNormalized, `%${q.toLowerCase()}%`));
  const partyDocketIds = partyRows.map((p) => p.docketId);

  const conds = [
    or(
      like(dockets.caseName, `%${q}%`),
      like(dockets.docketNumber, `%${q}%`),
      partyDocketIds.length > 0
        ? // crude OR list expansion; would use IN() with full Drizzle in prod
          or(...partyDocketIds.map((id) => eq(dockets.id, id)))
        : undefined
    ),
  ];
  if (court) conds.push(eq(dockets.court, court));

  const rows = await db
    .select()
    .from(dockets)
    .where(and(...conds))
    .orderBy(desc(dockets.dateFiled))
    .limit(limit);

  return ok(
    rows.map((d) => ({
      id: d.id,
      court: d.court,
      case_name: d.caseName,
      docket_number: d.docketNumber,
      date_filed: d.dateFiled?.toISOString().slice(0, 10) ?? null,
    }))
  );
}
