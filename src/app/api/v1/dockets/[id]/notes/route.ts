import { type NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { dockets, docketNotes } from "@/lib/db/schema";
import { newId } from "@/lib/db/ids";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  /api/v1/dockets/{id}/notes
 *
 *  Private per-org annotation on a docket. Markdown body. One row per
 *  (org, docket) — replace-on-write semantics, so we expose PUT rather
 *  than PATCH (the entire body replaces the prior body).
 *
 *  GET    → fetch the calling org's note for this docket. 200 with an
 *           empty `body` when no row exists.
 *  PUT    → create or replace. Pro+ only. Empty body deletes.
 *  DELETE → remove (idempotent — 204 even if already gone).
 *
 *  Notes are NEVER shared across orgs. Two different teams watching the
 *  same case see only their own annotation. Schema enforces this via the
 *  unique (org_id, docket_id) constraint.
 *
 *  Until the Drizzle migration for `docket_notes` is generated Tuesday,
 *  we lazy-CREATE the table on first request — same pattern as
 *  widget_pings + not_found_pings.
 * ==========================================================================*/

let initialized = false;
async function ensureTable() {
  if (initialized) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS docket_notes (
      id          TEXT PRIMARY KEY,
      org_id      TEXT NOT NULL,
      docket_id   TEXT NOT NULL,
      author_id   TEXT,
      body        TEXT NOT NULL DEFAULT '',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
      UNIQUE(org_id, docket_id)
    )
  `);
  initialized = true;
}

export async function OPTIONS() {
  return preflight();
}

function shape(row: typeof docketNotes.$inferSelect | null, orgId: string, docketId: string) {
  if (!row) {
    return {
      docket_id: docketId,
      org_id: orgId,
      body: "",
      exists: false,
      updated_at: null,
    };
  }
  return {
    docket_id: row.docketId,
    org_id: row.orgId,
    body: row.body,
    exists: true,
    updated_at: row.updatedAt?.toISOString() ?? null,
  };
}

async function docketExists(id: string): Promise<boolean> {
  const dbHit = (
    await db.select().from(dockets).where(eq(dockets.id, id)).limit(1)
  )[0];
  if (dbHit) return true;
  return SAMPLE_DOCKETS.some((d) => d.id === id);
}

async function lookup(orgId: string, docketId: string) {
  await ensureTable();
  const row = (
    await db
      .select()
      .from(docketNotes)
      .where(
        and(
          eq(docketNotes.orgId, orgId),
          eq(docketNotes.docketId, docketId)
        )
      )
      .limit(1)
  )[0];
  return row ?? null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  const { id } = await ctx.params;
  if (!(await docketExists(id))) return err("docket not found", 404);
  const row = await lookup(auth.orgId, id);
  return ok(shape(row, auth.orgId, id));
}

const PutBody = z.object({
  body: z.string().max(20_000), // 20KB cap; markdown text only
});

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan === "free") {
    return err("upgrade required for docket notes (Pro plan)", 402);
  }
  const { id } = await ctx.params;
  if (!(await docketExists(id))) return err("docket not found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("invalid JSON body", 400);
  }
  const parsed = PutBody.safeParse(body);
  if (!parsed.success) {
    return err("validation failed", 422, { issues: parsed.error.issues });
  }

  await ensureTable();
  // Empty body = delete the note
  if (parsed.data.body.trim() === "") {
    await db
      .delete(docketNotes)
      .where(
        and(eq(docketNotes.orgId, auth.orgId), eq(docketNotes.docketId, id))
      );
    return ok({ docket_id: id, org_id: auth.orgId, body: "", exists: false });
  }

  const existing = await lookup(auth.orgId, id);
  if (existing) {
    await db
      .update(docketNotes)
      .set({ body: parsed.data.body, updatedAt: new Date() })
      .where(eq(docketNotes.id, existing.id));
  } else {
    await db.insert(docketNotes).values({
      id: newId("note"),
      orgId: auth.orgId,
      docketId: id,
      authorId: null, // API-key write; bind to user once auth wires
      body: parsed.data.body,
    });
  }
  const fresh = await lookup(auth.orgId, id);
  return ok(shape(fresh, auth.orgId, id));
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan === "free") {
    return err("upgrade required for docket notes (Pro plan)", 402);
  }
  const { id } = await ctx.params;
  await ensureTable();
  await db
    .delete(docketNotes)
    .where(and(eq(docketNotes.orgId, auth.orgId), eq(docketNotes.docketId, id)));
  return new Response(null, { status: 204 });
}
