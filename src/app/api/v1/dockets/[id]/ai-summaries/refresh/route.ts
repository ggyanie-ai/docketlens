import { type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { newId } from "@/lib/db/ids";
import { eq } from "drizzle-orm";
import { dockets } from "@/lib/db/schema";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import { PROMPT_VERSION } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  POST /api/v1/dockets/{id}/ai-summaries/refresh
 *
 *  Queues an on-demand AI summarization for a docket. Returns 202 with
 *  an opaque `job_id` immediately; the actual regen runs out-of-band on
 *  the ingest worker pipeline (the same path /scripts/ingest.ts uses).
 *
 *  Pro+ only — summary regen consumes Anthropic budget. Free-tier callers
 *  get the cached one_liner only.
 *
 *  Today the worker hasn't been wired to consume from this queue (Tuesday
 *  task), so we persist the request to a tiny `ai_summary_refresh_queue`
 *  side-table (lazy CREATE TABLE IF NOT EXISTS, same pattern as
 *  widget_pings + not_found_pings). Clients can poll the underlying
 *  `/api/v1/dockets/{id}/ai-summaries` GET to detect when fresh rows
 *  appear; eventual job-status endpoint lands when the worker does.
 *
 *  Rate-limited at the application layer to 1 refresh per docket per
 *  60 seconds — a hot-poll loop would otherwise burn budget for no
 *  product reason.
 * ==========================================================================*/

let initialized = false;
async function ensureTable() {
  if (initialized) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ai_summary_refresh_queue (
      job_id        TEXT PRIMARY KEY,
      docket_id     TEXT NOT NULL,
      org_id        TEXT NOT NULL,
      requested_by  TEXT NOT NULL,
      prompt_version TEXT NOT NULL,
      requested_at  INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'queued',
      started_at    INTEGER,
      finished_at   INTEGER,
      error         TEXT
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS ai_summary_refresh_queue_docket_idx
      ON ai_summary_refresh_queue(docket_id, requested_at DESC)
  `);
  initialized = true;
}

const COOLDOWN_MS = 60_000;

export async function OPTIONS() {
  return preflight();
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);
  if (auth.plan === "free") {
    return err(
      "upgrade required for on-demand AI summary refresh (Pro plan)",
      402
    );
  }

  const { id } = await ctx.params;

  // Verify the docket exists (DB first, sample fallback for demos)
  const dbDocket = (
    await db.select().from(dockets).where(eq(dockets.id, id)).limit(1)
  )[0];
  const sample = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!dbDocket && !sample) return err("docket not found", 404);

  await ensureTable();

  // Per-docket cooldown to prevent budget burn from a hot poll loop.
  const recent = (await db.execute<{ requested_at: number }>(sql`
    SELECT requested_at FROM ai_summary_refresh_queue
    WHERE docket_id = ${id}
    ORDER BY requested_at DESC LIMIT 1
  `)).rows;
  const last = recent[0]?.requested_at ?? 0;
  const now = Date.now();
  if (now - last < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return err("refresh requested too recently — try again shortly", 429, {
      retry_after_seconds: retryAfter,
    });
  }

  const jobId = newId("job");
  await db.execute(sql`
    INSERT INTO ai_summary_refresh_queue
      (job_id, docket_id, org_id, requested_by, prompt_version, requested_at)
    VALUES
      (${jobId}, ${id}, ${auth.orgId}, ${auth.keyId}, ${PROMPT_VERSION}, ${now})
  `);

  return ok(
    {
      job_id: jobId,
      docket_id: id,
      status: "queued" as const,
      prompt_version: PROMPT_VERSION,
      requested_at: new Date(now).toISOString(),
      poll: `/api/v1/dockets/${id}/ai-summaries`,
      note: "Worker consumes from this queue Tuesday with the auth/Better-Auth pass. Poll the ai-summaries GET to detect fresh rows. `stale: true` flips to false once the new generation lands.",
    },
    {
      status: 202,
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
