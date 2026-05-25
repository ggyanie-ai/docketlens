import { type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchlists } from "@/lib/db/schema";
import { normalizeEntityName } from "@/lib/db/ids";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  /api/v1/watchlists/{id}
 *
 *  GET    → fetch one watchlist (must belong to the calling org)
 *  PATCH  → update name / match_value / refresh_cadence / filters /
 *           is_active. Pro+ plans only (mirrors the POST gate on the
 *           collection endpoint).
 *  DELETE → soft-delete (sets deleted_at). Pro+ only. Idempotent.
 *
 *  Tightens the REST surface so consumers can complete the CRUD quad
 *  without falling back to the in-app UI.
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

async function lookup(orgId: string, id: string) {
  const row = (
    await db
      .select()
      .from(watchlists)
      .where(
        and(
          eq(watchlists.id, id),
          eq(watchlists.orgId, orgId),
          isNull(watchlists.deletedAt)
        )
      )
      .limit(1)
  )[0];
  return row ?? null;
}

function shape(w: typeof watchlists.$inferSelect) {
  return {
    id: w.id,
    name: w.name,
    entity_type: w.entityType,
    match_value: w.matchValue,
    refresh_cadence: w.refreshCadence,
    is_active: w.isActive,
    match_count: w.matchCount,
    filters: w.filters,
    created_at: w.createdAt?.toISOString() ?? null,
    updated_at: w.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  const { id } = await ctx.params;
  const w = await lookup(auth.orgId, id);
  if (!w) return err("not found", 404);
  return ok(shape(w));
}

const PatchBody = z
  .object({
    name: z.string().min(1).optional(),
    match_value: z.string().min(1).optional(),
    refresh_cadence: z.enum(["realtime", "hourly", "daily"]).optional(),
    is_active: z.boolean().optional(),
    filters: z
      .object({
        courts: z.array(z.string()).optional(),
        natureOfSuitCodes: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "at least one field is required",
  });

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan === "free") {
    return err("upgrade required for API write access (Team plan)", 402);
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid JSON body", 400);
  }
  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) {
    return err("validation failed", 422, { issues: parsed.error.issues });
  }

  const existing = await lookup(auth.orgId, id);
  if (!existing) return err("not found", 404);

  // Build the update payload selectively — only set fields the caller sent.
  const patch: Partial<typeof watchlists.$inferInsert> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.match_value !== undefined) {
    patch.matchValue = parsed.data.match_value;
    patch.matchValueNormalized = normalizeEntityName(parsed.data.match_value);
  }
  if (parsed.data.refresh_cadence !== undefined) {
    patch.refreshCadence = parsed.data.refresh_cadence;
  }
  if (parsed.data.is_active !== undefined) patch.isActive = parsed.data.is_active;
  if (parsed.data.filters !== undefined) patch.filters = parsed.data.filters;
  patch.updatedAt = new Date();

  await db.update(watchlists).set(patch).where(eq(watchlists.id, id));
  const updated = await lookup(auth.orgId, id);
  return ok(shape(updated!));
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan === "free") {
    return err("upgrade required for API write access (Team plan)", 402);
  }

  const { id } = await ctx.params;
  const existing = await lookup(auth.orgId, id);
  if (!existing) {
    // Idempotent — deleting an already-deleted row returns the same 204.
    return new Response(null, { status: 204 });
  }
  await db
    .update(watchlists)
    .set({ deletedAt: new Date(), updatedAt: new Date(), isActive: false })
    .where(eq(watchlists.id, id));
  return new Response(null, { status: 204 });
}
