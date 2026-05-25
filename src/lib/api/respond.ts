import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers":
    "authorization,content-type,x-docketlens-key,if-none-match,x-request-id",
  // Expose the request id so cross-origin clients can read it back —
  // browsers strip non-safelisted headers from JS unless we whitelist.
  "access-control-expose-headers":
    "etag,x-request-id,x-ratelimit-limit,x-ratelimit-remaining,x-ratelimit-reset,x-docketlens-cl-pool-remaining",
};

/** Fresh request id when the caller didn't send one. Tools that DO send
 *  one (Postman, our own retries) get their value echoed back unchanged
 *  so end-to-end traces line up. */
function requestId(): string {
  return `req_${randomUUID().replace(/-/g, "")}`;
}

function mergeHeaders(init?: ResponseInit): Record<string, string> {
  const reqId = requestId();
  return {
    ...CORS_HEADERS,
    "x-request-id": reqId,
    ...(init?.headers as Record<string, string> | undefined),
  };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { ok: true, data },
    { ...init, headers: mergeHeaders(init) }
  );
}

export function err(
  message: string,
  code: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status: code, headers: mergeHeaders() }
  );
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: mergeHeaders() });
}
