import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { watchlists } from "@/lib/db/schema";
import { ids, normalizeEntityName } from "@/lib/db/ids";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { and, eq, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const rows = await db
    .select()
    .from(watchlists)
    .where(
      and(eq(watchlists.orgId, auth.orgId), isNull(watchlists.deletedAt))
    );

  return ok(
    rows.map((w) => ({
      id: w.id,
      name: w.name,
      entity_type: w.entityType,
      match_value: w.matchValue,
      refresh_cadence: w.refreshCadence,
      is_active: w.isActive,
      match_count: w.matchCount,
      filters: w.filters,
    }))
  );
}

const SingleCreate = z.object({
  name: z.string().min(1),
  entity_type: z.enum(["party", "attorney", "judge", "lawfirm", "case", "term"]),
  match_value: z.string().min(1),
  refresh_cadence: z.enum(["realtime", "hourly", "daily"]).default("daily"),
  filters: z
    .object({
      courts: z.array(z.string()).optional(),
      natureOfSuitCodes: z.array(z.string()).optional(),
    })
    .optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

// Accept either a single object or an array of up to 50. Single returns
// 201 { id }; bulk returns 201 { count, ids } so the shape disambiguates.
const CreateBody = z.union([SingleCreate, z.array(SingleCreate).min(1).max(50)]);

type SingleCreate = z.infer<typeof SingleCreate>;

function buildRow(orgId: string, keyId: string, p: SingleCreate) {
  return {
    id: ids.watchlist(),
    orgId,
    createdBy: keyId, // placeholder — API-key-created watches reference the key
    name: p.name,
    entityType: p.entity_type,
    matchValue: p.match_value,
    matchValueNormalized: normalizeEntityName(p.match_value),
    filters: p.filters ?? {},
    isActive: true,
    refreshCadence: p.refresh_cadence,
    priority: p.priority ?? 50,
  };
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  if (auth.plan === "free") {
    return err("upgrade required for API write access (Team plan)", 402);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid JSON body", 400);
  }

  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return err("validation failed", 422, { issues: parsed.error.issues });
  }

  // Bulk path: array of bodies, single transaction
  if (Array.isArray(parsed.data)) {
    const rows = parsed.data.map((p) => buildRow(auth.orgId, auth.keyId, p));
    await db.insert(watchlists).values(rows);
    return ok(
      {
        count: rows.length,
        ids: rows.map((r) => r.id),
      },
      { status: 201 }
    );
  }

  // Single path: legacy shape — return { id }
  const row = buildRow(auth.orgId, auth.keyId, parsed.data);
  await db.insert(watchlists).values(row);
  return ok({ id: row.id }, { status: 201 });
}
