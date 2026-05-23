import { NextResponse } from "next/server";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type,x-docketlens-key",
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { ok: true, data },
    { ...init, headers: { ...CORS_HEADERS, ...(init?.headers as Record<string, string> | undefined) } }
  );
}

export function err(
  message: string,
  code: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status: code, headers: CORS_HEADERS }
  );
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
