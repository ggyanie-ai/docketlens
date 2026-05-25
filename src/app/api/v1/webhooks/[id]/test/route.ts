import { type NextRequest } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { alertRules, watchlists } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  POST /api/v1/webhooks/{id}/test
 *
 *  Fires a sample payload at one specific webhook destination so the
 *  user can validate their handler before turning real alerts on. The
 *  payload is signed with HMAC-SHA256 using the same scheme prod
 *  webhooks use (`X-DocketLens-Signature: sha256=<hex>` — see
 *  /tools/verify-webhook and /docs/api for the verifier).
 *
 *  Returns:
 *    { status: <HTTP status from the endpoint>,
 *      latency_ms: <wall clock>,
 *      response_excerpt: <first 256 chars of response body>,
 *      delivery_id: req_<uuid> }
 *
 *  Hard 5-second timeout on the outbound POST so a slow endpoint
 *  doesn't hang the request. Pro+ only.
 *
 *  Auth + org scoping: alertRules has no orgId column, so we INNER
 *  JOIN watchlists to verify the calling org owns the rule.
 *
 *  IMPORTANT: today the org-side signing secret isn't a separate
 *  per-org row — it's read from the env (DOCKETLENS_WEBHOOK_SECRET)
 *  the same way prod sends do. Tuesday's auth pass adds a per-org
 *  `webhook_secret` column on `orgs`; until then every test
 *  delivery is signed with the shared dev secret + the rule id.
 * ==========================================================================*/

const TIMEOUT_MS = 5_000;
const MAX_RESPONSE_BYTES = 256;

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
    return err("upgrade required (Pro plan)", 402);
  }

  const { id } = await ctx.params;

  // Look up the rule + verify org ownership in one join.
  const [hit] = await db
    .select({
      ruleId: alertRules.id,
      target: alertRules.target,
      channel: alertRules.channel,
    })
    .from(alertRules)
    .innerJoin(watchlists, eq(watchlists.id, alertRules.watchlistId))
    .where(
      and(eq(alertRules.id, id), eq(watchlists.orgId, auth.orgId))
    )
    .limit(1);
  if (!hit) return err("webhook not found", 404);
  if (hit.channel !== "webhook") {
    return err(
      "this rule's channel isn't a webhook — test only valid for webhook channels",
      400
    );
  }

  // Build a sample event payload that mirrors what the worker sends.
  const deliveryId = `req_${randomUUID().replace(/-/g, "")}`;
  const payload = JSON.stringify({
    event: "match.test",
    delivery_id: deliveryId,
    rule_id: hit.ruleId,
    subject: "DocketLens test delivery",
    text: "This is a test event. If your handler verified the signature, you'll never receive this in production.",
    ts: new Date().toISOString(),
  });

  // Sign with the dev/prod shared secret. Tuesday: replace with per-org
  // secret pulled from orgs.webhook_secret.
  const secret =
    process.env.DOCKETLENS_WEBHOOK_SECRET ?? `dev_${hit.ruleId}`;
  const sig =
    "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");

  const t0 = performance.now();
  let status = 0;
  let excerpt = "";
  let outboundError: string | null = null;

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    const r = await fetch(hit.target, {
      method: "POST",
      signal: ctl.signal,
      headers: {
        "content-type": "application/json",
        "x-docketlens-signature": sig,
        "x-docketlens-delivery-id": deliveryId,
        "user-agent": "DocketLens/test-delivery (+https://docketlens.ai)",
      },
      body: payload,
    });
    clearTimeout(timer);
    status = r.status;
    try {
      const body = await r.text();
      excerpt = body.slice(0, MAX_RESPONSE_BYTES);
    } catch {
      excerpt = "(no body)";
    }
  } catch (e) {
    outboundError = e instanceof Error ? e.message : String(e);
  }

  const latencyMs = Math.round(performance.now() - t0);

  return ok(
    {
      delivery_id: deliveryId,
      rule_id: hit.ruleId,
      target: hit.target,
      status,
      latency_ms: latencyMs,
      ok: status >= 200 && status < 300,
      response_excerpt: excerpt,
      error: outboundError,
      signature_header: "x-docketlens-signature",
      note: "Body bytes are signed exactly as sent. Verify with HMAC-SHA256 + shared secret. See /tools/verify-webhook for a playground.",
    },
    {
      headers: { "cache-control": "no-store" },
    }
  );
}
