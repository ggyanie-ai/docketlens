import { type NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/events
 *
 *  Server-Sent Events stream of `match.created` events for the calling
 *  org. Today this is a phase-1 stub: the connection stays open, sends
 *  a heartbeat every 25 seconds, and replays no historical events. The
 *  worker that publishes match.created onto an in-process channel
 *  (and ultimately a Redis pub/sub or Pulsar topic) lands with the
 *  ingest-wire pass Tuesday.
 *
 *  The stub exists today so consumers can integrate the protocol
 *  shape — when the worker turns on, no client change is required.
 *
 *  Protocol:
 *    event: ready         { ts, plan }      — sent once on connect
 *    event: heartbeat     { ts }            — every 25s
 *    event: match.created { match, docket, entry }  — when the worker
 *                                                     publishes them
 *
 *  Auth required; no plan gate (SSE is read-only). Connection holds
 *  open until the client disconnects or 30 minutes elapses (whichever
 *  comes first), to keep dev / hosting timeouts predictable.
 * ==========================================================================*/

const MAX_DURATION_MS = 30 * 60_000; // 30 minutes per connection
const HEARTBEAT_MS = 25_000;

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const start = Date.now();
      controller.enqueue(
        enc.encode(sse("ready", { ts: new Date().toISOString(), plan: auth.plan }))
      );
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            enc.encode(sse("heartbeat", { ts: new Date().toISOString() }))
          );
        } catch {
          // controller already closed by upstream cancel — swallow
        }
        if (Date.now() - start > MAX_DURATION_MS) {
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      }, HEARTBEAT_MS);

      // Cleanup on client disconnect
      const abortSignal = req.signal;
      abortSignal?.addEventListener("abort", () => {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no", // hint to reverse proxies (nginx)
      connection: "keep-alive",
      "access-control-allow-origin": "*",
      "access-control-expose-headers":
        "x-request-id, x-docketlens-cl-pool-remaining",
    },
  });
}
