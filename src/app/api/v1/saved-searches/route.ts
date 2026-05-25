import { type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";
import { ids } from "@/lib/db/ids";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  /api/v1/saved-searches
 *
 *  GET  → list every saved search for the calling org, newest first
 *  POST → create a new saved search (Pro+; mirrors the watchlist POST gate)
 *
 *  The in-app /search page keeps using localStorage today — until auth +
 *  the user/session flow lands Tuesday, there's no logged-in user to bind
 *  rows to. This API works against the existing `saved_searches` table so
 *  programmatic consumers (CLIs, mobile apps, the eventual desktop client)
 *  can manage rows independently of the browser localStorage cache.
 *
 *  Sibling endpoint `/api/v1/saved-searches/{id}` handles GET/PATCH/DELETE
 *  for individual rows, and the existing
 *  `/api/v1/saved-searches/{id}/feed.{xml,atom,json}` keeps emitting RSS
 *  for the same id space. All three share one source of truth.
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
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

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const rows = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.orgId, auth.orgId))
    .orderBy(desc(savedSearches.createdAt));

  return ok({
    count: rows.length,
    saved_searches: rows.map(shape),
  });
}

const QueryShape = z.object({
  q: z.string().optional().nullable(),
  court: z.string().optional().nullable(),
  nos: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
});

const CreateBody = z.object({
  name: z.string().min(1).max(120),
  query: QueryShape,
  is_pinned: z.boolean().optional(),
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

  const id = ids.search();
  await db.insert(savedSearches).values({
    id,
    orgId: auth.orgId,
    // API-key-created rows reference the key id as the creator. When auth
    // lands Tuesday this gets replaced with the bound user_id.
    createdBy: auth.keyId,
    name: parsed.data.name.trim(),
    query: parsed.data.query as Record<string, unknown>,
    isPinned: parsed.data.is_pinned ?? false,
  });

  return ok({ id }, { status: 201 });
}
