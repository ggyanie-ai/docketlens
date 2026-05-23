import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dockets } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { desc, like, and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? "20"), 100);
  const court = sp.get("court");
  const q = sp.get("q");

  const conds = [];
  if (court) conds.push(eq(dockets.court, court));
  if (q) conds.push(like(dockets.caseName, `%${q}%`));

  const rows = await db
    .select()
    .from(dockets)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(dockets.dateFiled))
    .limit(limit);

  return ok(
    rows.map((d) => ({
      id: d.id,
      court: d.court,
      case_name: d.caseName,
      docket_number: d.docketNumber,
      nature_of_suit: d.natureOfSuit,
      date_filed: d.dateFiled?.toISOString().slice(0, 10) ?? null,
      assigned_to: d.assignedTo,
    }))
  );
}
