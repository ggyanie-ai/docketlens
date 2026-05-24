import { openapi } from "@/lib/openapi";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(openapi, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });
}
