import { type NextRequest } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { dockets, docketEntries, aiSummaries } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { PROMPT_VERSION } from "@/lib/ai/prompts";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/dockets/{id}/ai-summaries
 *
 *  Returns extractive AI summaries for a docket and its entries.
 *
 *  Tier gating:
 *    free   → `one_liner` only (the same tier the marketing site shows
 *             unauthenticated). Reflects the user-facing pricing.
 *    pro+   → all three tiers (one_liner, paragraph, exec).
 *
 *  Sources, in order of preference:
 *    1. Cached rows in the `ai_summaries` table (current PROMPT_VERSION only —
 *       older rows are still returned but flagged with `stale: true`).
 *    2. For demo dockets that haven't run through the worker yet, falls back
 *       to the seeded summaries on SAMPLE_DOCKETS so the response is never
 *       empty for the eight canonical demos.
 *
 *  Hard contract: we restate what's on the docket. We never predict outcomes,
 *  characterize parties, or invent context. See /docs/api for the full
 *  extractive-only invariant.
 * ==========================================================================*/

type Tier = "one_liner" | "paragraph" | "exec";

const TIERS_FREE: Tier[] = ["one_liner"];
const TIERS_PAID: Tier[] = ["one_liner", "paragraph", "exec"];

export async function OPTIONS() {
  return preflight();
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized — provide Bearer dkl_live_…", 401);

  const { id } = await ctx.params;
  const allowed = auth.plan === "free" ? TIERS_FREE : TIERS_PAID;

  /* ─── 1. Resolve docket: DB first, sample fallback ─────────────────────── */

  const dbDocket = (
    await db.select().from(dockets).where(eq(dockets.id, id)).limit(1)
  )[0];
  const sample = SAMPLE_DOCKETS.find((d) => d.id === id);

  if (!dbDocket && !sample) return err("docket not found", 404);

  const caseName = dbDocket?.caseName ?? sample!.caseName;
  const court = dbDocket?.court ?? sample!.court;

  /* ─── 2. Entry list ───────────────────────────────────────────────────── */

  const dbEntries = dbDocket
    ? await db
        .select()
        .from(docketEntries)
        .where(eq(docketEntries.docketId, id))
    : [];
  const sampleEntries = sample?.entries ?? [];
  // Prefer DB rows; supplement with any sample-only entries (demo case).
  const seenIds = new Set(dbEntries.map((e) => e.id));
  const entries = [
    ...dbEntries.map((e) => ({
      id: e.id,
      short: e.shortDescription ?? "",
      dateFiled: e.dateFiled?.toISOString().slice(0, 10) ?? null,
    })),
    ...sampleEntries
      .filter((e) => !seenIds.has(e.id))
      .map((e) => ({ id: e.id, short: e.short, dateFiled: e.dateFiled })),
  ];

  /* ─── 3. Pull cached summaries from the ai_summaries table ─────────────── */

  const cached =
    entries.length > 0
      ? await db
          .select()
          .from(aiSummaries)
          .where(
            and(
              inArray(
                aiSummaries.entityId,
                [id, ...entries.map((e) => e.id)]
              ),
              inArray(aiSummaries.tier, allowed)
            )
          )
      : [];

  // Index by (entityType, entityId, tier).
  type CachedRow = {
    content: string;
    promptVersion: string;
    model: string;
    stale: boolean;
  };
  const cacheByEntity = new Map<string, Map<Tier, CachedRow>>();
  for (const row of cached) {
    const key = `${row.entityType}:${row.entityId}`;
    let inner = cacheByEntity.get(key);
    if (!inner) {
      inner = new Map();
      cacheByEntity.set(key, inner);
    }
    const tier = row.tier as Tier;
    const prev = inner.get(tier);
    const isCurrent = row.promptVersion === PROMPT_VERSION;
    // Prefer current PROMPT_VERSION over older rows.
    if (!prev || (isCurrent && prev.stale)) {
      inner.set(tier, {
        content: row.content,
        promptVersion: row.promptVersion,
        model: row.model,
        stale: !isCurrent,
      });
    }
  }

  function lookup(entityType: "docket" | "entry", entityId: string) {
    return cacheByEntity.get(`${entityType}:${entityId}`);
  }

  /* ─── 4. Sample fallbacks ─────────────────────────────────────────────── */
  // `summaryOne` and `summaryPara` on SAMPLE_DOCKETS act as the seeded
  // extractive copy that ships with the demo cases.

  function buildEntryPayload(entryId: string) {
    const out: Record<string, unknown> = {};
    const cache = lookup("entry", entryId);
    const seed = sample?.entries.find((e) => e.id === entryId);

    for (const tier of allowed) {
      const hit = cache?.get(tier);
      if (hit) {
        out[tier] = {
          content: hit.content,
          source: "cache" as const,
          prompt_version: hit.promptVersion,
          model: hit.model,
          stale: hit.stale,
        };
        continue;
      }
      // Sample fallback — only one_liner + paragraph carry seeded text.
      if (tier === "one_liner" && seed?.summaryOne) {
        out[tier] = {
          content: seed.summaryOne,
          source: "demo" as const,
          prompt_version: PROMPT_VERSION,
          model: "sample-data",
          stale: false,
        };
      } else if (tier === "paragraph" && seed?.summaryPara) {
        out[tier] = {
          content: seed.summaryPara,
          source: "demo" as const,
          prompt_version: PROMPT_VERSION,
          model: "sample-data",
          stale: false,
        };
      } else {
        out[tier] = null;
      }
    }
    return out;
  }

  function buildDocketPayload() {
    const out: Record<string, unknown> = {};
    const cache = lookup("docket", id);
    for (const tier of allowed) {
      const hit = cache?.get(tier);
      if (hit) {
        out[tier] = {
          content: hit.content,
          source: "cache" as const,
          prompt_version: hit.promptVersion,
          model: hit.model,
          stale: hit.stale,
        };
      } else {
        out[tier] = null;
      }
    }
    return out;
  }

  /* ─── 5. Shape the response ───────────────────────────────────────────── */

  return ok(
    {
      docket: {
        id,
        case_name: caseName,
        court,
        summaries: buildDocketPayload(),
      },
      entries: entries.map((e) => ({
        entry_id: e.id,
        date_filed: e.dateFiled,
        short_description: e.short,
        summaries: buildEntryPayload(e.id),
      })),
      meta: {
        prompt_version_current: PROMPT_VERSION,
        plan: auth.plan,
        tiers_returned: allowed,
        extractive_only: true,
        docs: "https://docketlens.ai/docs/api",
      },
    },
    {
      headers: {
        // Per-plan caching. Free is identical across all callers, so we can
        // cache aggressively. Paid plans are per-org but we still allow short
        // private caching since the response is read-only.
        "cache-control":
          auth.plan === "free"
            ? "public, max-age=300, stale-while-revalidate=600"
            : "private, max-age=60",
      },
    }
  );
}
