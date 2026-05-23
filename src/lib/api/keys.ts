import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, orgs } from "@/lib/db/schema";

/* ============================================================================
 *  API key authentication for /api/v1/*.
 *
 *  Token shape:  dkl_live_<base64url(24 bytes)>
 *  We store the SHA-256 of the full token + the prefix (first 12 chars) for
 *  display purposes ("dkl_live_w7Q…"). Compare in constant time.
 * ==========================================================================*/

const PREFIX_LIVE = "dkl_live_";

export function generateApiKey(): { token: string; tokenHash: string; tokenPrefix: string } {
  const buf = randomBytes(24);
  const body = buf.toString("base64url");
  const token = `${PREFIX_LIVE}${body}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const tokenPrefix = token.slice(0, 12); // dkl_live_xxx
  return { token, tokenHash, tokenPrefix };
}

export async function authenticateApiRequest(
  header: string | null
): Promise<{ orgId: string; keyId: string; scopes: string[]; plan: string } | null> {
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1].trim();
  if (!token.startsWith(PREFIX_LIVE)) return null;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = (
    await db.select().from(apiKeys).where(eq(apiKeys.tokenHash, tokenHash)).limit(1)
  )[0];
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;

  // constant-time compare safety net (tokenHash is unique-indexed, but defense in depth)
  const expected = Buffer.from(row.tokenHash, "hex");
  const actual = Buffer.from(tokenHash, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  // touch last_used asynchronously — not awaited
  db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id))
    .catch((e) => console.warn("apiKeys last_used update failed:", (e as Error).message));

  const org = (
    await db.select().from(orgs).where(eq(orgs.id, row.orgId)).limit(1)
  )[0];
  if (!org) return null;

  return {
    orgId: row.orgId,
    keyId: row.id,
    scopes: row.scopes,
    plan: org.plan,
  };
}
