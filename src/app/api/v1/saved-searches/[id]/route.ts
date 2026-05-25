import { type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  /api/v1/saved-searches/{id}
 *
 *  GET    → fetch one row (must belong to caller's org)
 *  PATCH  → update name / query / is_pinned (Pro+; sparse — only sent
 *           fields are touched)
 *  DELETE → hard-delete (Pro+; idempotent — 204 even when already gone)
 *
 *  Note: saved searches don't have a deleted_at column today. We hard-delete
 *  because they're cheap to recreate and shouldn't accumulate.
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

async function lookup(orgId: string, id: string) {
  const row = (
    await db
      .select()
      .from(savedSearches)
      .where(
        and(eq(savedSearches.id, id), eq(savedSearches.orgId, orgId))
      )
      .limit(1)
  )[0];
  return row ?? null;
}

function shape(s: typeof savedSearches.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    query: s.query,
    is_pinned: s.isPinned,
    created_at: s.createdAt?.toISOString() ?? null,
    updated_at: s.updatedAt?.toISOString() ?? null,
  };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  const { id } = await ctx.params;
  const row = await lookup(auth.orgId, id);
  if (!row) return err("not found", 404);
  return ok(shape(row));
}

const QueryShape = z.object({
  q: z.string().optional().nullable(),
  court: z.string().optional().nullable(),
  nos: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
});

const PatchBody = z
  .object({
    name: z.string().min(1).max(120).optional(),
    query: QueryShape.optional(),
    is_pinned: z.boolean().optional(),
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

  const patch: Partial<typeof savedSearches.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name.trim();
  if (parsed.data.query !== undefined)
    patch.query = parsed.data.query as Record<string, unknown>;
  if (parsed.data.is_pinned !== undefined) patch.isPinned = parsed.data.is_pinned;

  await db.update(savedSearches).set(patch).where(eq(savedSearches.id, id));
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
  await db
    .delete(savedSearches)
    .where(
      and(eq(savedSearches.id, id), eq(savedSearches.orgId, auth.orgId))
    );
  // Idempotent — return 204 whether anything matched or not
  return new Response(null, { status: 204 });
}
