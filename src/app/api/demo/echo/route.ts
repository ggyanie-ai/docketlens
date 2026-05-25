import { type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  POST /api/demo/echo  (loopback receiver for /api/demo/test-webhook)
 *
 *  Stand-in for a real customer webhook handler. Verifies the
 *  HMAC-SHA256 signature the same way the docs recommend, then echoes
 *  back the verification result and a few bytes of the payload. No
 *  side effects, no DB, no auth — this exists purely so the /alerts
 *  "Send a test webhook" button has a real round-trip to talk to.
 * ==========================================================================*/

export async function POST(req: NextRequest) {
  const body = await req.text();
  const provided = req.headers.get("x-docketlens-signature") ?? "";
  const secret = process.env.DOCKETLENS_WEBHOOK_SECRET ?? "dev_demo";
  const expected =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex");

  let valid = false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    valid = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    valid = false;
  }

  return Response.json(
    {
      ok: true,
      received_bytes: body.length,
      signature_valid: valid,
      delivery_id: req.headers.get("x-docketlens-delivery-id"),
    },
    { headers: { "cache-control": "no-store" } }
  );
}
