import { type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  POST /api/log-404
 *
 *  Optional telemetry endpoint the /404 DidYouMean island fires once per
 *  load when the requested path lands in the not-found handler. Lets us
 *  see which typos are common enough to deserve a real redirect — without
 *  storing anything per-person.
 *
 *  Privacy model (matches /api/widget-ping):
 *   - We record only `(path, day, count)`, never an IP / UA / referrer
 *     / session / cookie.
 *   - The path is normalised: lowercased, trailing slash stripped,
 *     anything past 200 chars dropped.
 *   - Anyone can disable client-side via the existing "Do Not Track"
 *     respect in the DidYouMean island (a single localStorage flag the
 *     user controls).
 *
 *  Storage shape mirrors widget_pings — a tiny side-table created lazily
 *  via `CREATE TABLE IF NOT EXISTS`. No Drizzle migration coupling.
 * ==========================================================================*/

let initialized = false;

async function ensureTable() {
  if (initialized) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS not_found_pings (
      path  TEXT NOT NULL,
      day   TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (path, day)
    )
  `);
  initialized = true;
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalize(raw: string): string {
  // Drop hash, normalise trailing slash, lowercase, cap length so a
  // malicious caller can't flood the table with huge keys.
  const noHash = raw.split("#")[0];
  const noTrail = noHash.replace(/\/+$/, "") || "/";
  return noTrail.slice(0, 200).toLowerCase();
}

export async function POST(req: NextRequest) {
  let body: { path?: string } = {};
  try {
    body = (await req.json()) as { path?: string };
  } catch {
    return new Response(null, { status: 204 });
  }
  const path = typeof body.path === "string" ? normalize(body.path) : "";
  // Only record real paths (drop home + empty + obvious garbage)
  if (!path || path === "/" || !path.startsWith("/")) {
    return new Response(null, { status: 204 });
  }
  // Don't record paths that clearly came from a misbehaving scanner
  if (/\.(php|asp|jsp|env|git|ds_store)$/i.test(path)) {
    return new Response(null, { status: 204 });
  }
  try {
    await ensureTable();
    await db.execute(sql`
      INSERT INTO not_found_pings (path, day, count) VALUES (${path}, ${utcDay()}, 1)
      ON CONFLICT(path, day) DO UPDATE SET count = count + 1
    `);
  } catch {
    // Fail-quiet — this is telemetry, not a user-blocking write
  }
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
