import { type NextRequest } from "next/server";
import { createHmac, randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  POST /api/demo/test-webhook
 *
 *  Public, no-auth demo of a signed webhook delivery. Sample payload
 *  is signed with the dev secret + POSTed to a loopback echo handler
 *  (/api/demo/echo) so the round-trip is real (sign → HTTPS POST →
 *  HMAC-verify → response → latency) without needing the caller to
 *  have a webhook configured.
 *
 *  Used by the "Send a test webhook" button on /alerts. The real,
 *  per-webhook variant is POST /api/v1/webhooks/{id}/test.
 * ==========================================================================*/

const TIMEOUT_MS = 5_000;

export async function POST(req: NextRequest) {
  const deliveryId = `req_${randomUUID().replace(/-/g, "")}`;
  const payload = JSON.stringify({
    event: "match.test",
    delivery_id: deliveryId,
    subject: "DocketLens test delivery (demo)",
    text: "This is a test event signed with HMAC-SHA256.",
    ts: new Date().toISOString(),
  });

  const secret = process.env.DOCKETLENS_WEBHOOK_SECRET ?? "dev_demo";
  const sig =
    "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");

  const origin = new URL(req.url).origin;
  const target = `${origin}/api/demo/echo`;

  const t0 = performance.now();
  let status = 0;
  let signatureValid = false;
  let error: string | null = null;

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    const r = await fetch(target, {
      method: "POST",
      signal: ctl.signal,
      headers: {
        "content-type": "application/json",
        "x-docketlens-signature": sig,
        "x-docketlens-delivery-id": deliveryId,
        "user-agent": "DocketLens/demo-test-delivery",
      },
      body: payload,
    });
    clearTimeout(timer);
    status = r.status;
    try {
      const j = (await r.json()) as { signature_valid?: boolean };
      signatureValid = !!j.signature_valid;
    } catch {
      signatureValid = false;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const latencyMs = Math.round(performance.now() - t0);

  return Response.json(
    {
      delivery_id: deliveryId,
      target,
      status,
      latency_ms: latencyMs,
      ok: status >= 200 && status < 300,
      signature_valid: signatureValid,
      payload_bytes: payload.length,
      signature_header: "x-docketlens-signature",
      error,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
