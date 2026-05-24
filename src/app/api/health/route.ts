import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { PROMPT_VERSION } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/health
 *
 *  Cheap liveness ping for uptime monitors (BetterStack, Updown, internal).
 *  Returns 200 with `{ ok: true, ... }` when everything we can quickly check
 *  is healthy, 503 with `{ ok: false, ... }` otherwise.
 *
 *  Intentionally light:
 *   - No auth (it's a public probe).
 *   - Single DB round-trip (`select 1`) with a hard 2-second timeout.
 *   - No CL / Anthropic / Resend calls — those are dependencies of the
 *     ingest worker, not the web app, and they shouldn't 5xx /api/health if
 *     they have an outage.
 *
 *  Most monitors only check the HTTP status, so the shape below is just for
 *  humans hitting the URL.
 * ==========================================================================*/

const startedAt = Date.now();
const SERVICE = "docketlens-web";
const VERSION = "0.1.1";

async function pingDb(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const t0 = performance.now();
  try {
    await Promise.race([
      db.run(sql`select 1`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db ping timeout")), 2000)
      ),
    ]);
    return { ok: true, latencyMs: Math.round(performance.now() - t0) };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - t0),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const ts = new Date().toISOString();
  const db = await pingDb();

  const checks = {
    db: { ok: db.ok, latency_ms: db.latencyMs, error: db.error },
  };

  const allOk = Object.values(checks).every((c) => c.ok);

  const body = {
    ok: allOk,
    status: allOk ? "healthy" : "degraded",
    service: SERVICE,
    version: VERSION,
    prompt_version: PROMPT_VERSION,
    ts,
    uptime_seconds: Math.round((Date.now() - startedAt) / 1000),
    git_sha:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.GIT_SHA?.slice(0, 7) ??
      "local",
    checks,
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "cache-control": "no-store, max-age=0",
    },
  });
}

export async function HEAD() {
  // Some monitors do a HEAD-only check; we honor it with no body.
  const db = await pingDb();
  return new Response(null, {
    status: db.ok ? 200 : 503,
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
