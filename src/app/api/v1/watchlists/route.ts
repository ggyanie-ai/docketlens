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

const CreateBody = z.object({
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
});

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

  const id = ids.watchlist();
  await db.insert(watchlists).values({
    id,
    orgId: auth.orgId,
    createdBy: auth.keyId, // placeholder — API-key-created watches reference the key
    name: parsed.data.name,
    entityType: parsed.data.entity_type,
    matchValue: parsed.data.match_value,
    matchValueNormalized: normalizeEntityName(parsed.data.match_value),
    filters: parsed.data.filters ?? {},
    isActive: true,
    refreshCadence: parsed.data.refresh_cadence,
  });

  return ok({ id }, { status: 201 });
}
