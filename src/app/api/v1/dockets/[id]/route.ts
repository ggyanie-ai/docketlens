import { type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { dockets, docketEntries, parties } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { courtListenerPoolSnapshot } from "@/lib/courtlistener/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

function maxMs(...dates: (Date | null | undefined)[]): number {
  let best = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = d.getTime();
    if (t > best) best = t;
  }
  return best;
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

  // Strong ETag derived from the docket id + the freshest mtime across
  // docket/entries/parties. Stable across requests until a relation changes,
  // so poll loops can `If-None-Match` and get a 304 with no payload. Trims
  // bandwidth dramatically on the dashboard's recent-filings polls.
  const fresh = Math.max(
    maxMs(docket.updatedAt, docket.createdAt),
    ...entries.map((e) => maxMs(e.updatedAt, e.createdAt)),
    ...partyRows.map((p) => maxMs(p.updatedAt, p.createdAt))
  );
  const etag = `"${createHash("sha256")
    .update(`${id}|${fresh}|${entries.length}|${partyRows.length}`)
    .digest("base64url")
    .slice(0, 24)}"`;

  // CL pool advisory — informational for ingest-aware clients. Same value
  // as /api/health's `checks.cl_pool.remaining.per_day`.
  const pool = courtListenerPoolSnapshot();

  // Conditional GET — strip the body when the client already has it.
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        etag,
        "cache-control": "private, max-age=60",
        "x-docketlens-cl-pool-remaining": String(pool.remaining.per_day),
      },
    });
  }

  return ok(
    {
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
    },
    {
      headers: {
        etag,
        "cache-control": "private, max-age=60",
        "x-docketlens-cl-pool-remaining": String(pool.remaining.per_day),
      },
    }
  );
}
