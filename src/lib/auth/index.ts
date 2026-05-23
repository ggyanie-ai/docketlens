/* ============================================================================
 *  Auth wiring
 *
 *  For Tuesday (post-launch wire-up) we'll plug in Better-Auth with:
 *    - email magic-link (Resend)
 *    - Google OAuth (env-gated)
 *    - org plugin for multi-tenant
 *    - bearer-token plugin for API key auth on /api/v1/*
 *
 *  Until then this module exposes a minimal interface that the rest of the
 *  app can call against. `getCurrentSession()` falls back to a dev session
 *  when DB has no real session — so the (app) shell stays usable locally.
 * ==========================================================================*/

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, orgs, orgMembers, sessions } from "@/lib/db/schema";

export interface AuthSession {
  user: { id: string; email: string; name: string | null };
  org: { id: string; name: string; slug: string; plan: string };
  role: "owner" | "admin" | "member";
  isDev: boolean;
}

const DEV_EMAIL = "ggyanie.ai@gmail.com";

export async function getCurrentSession(
  /** Cookie-borne session token; null in pure server contexts. */
  token?: string | null
): Promise<AuthSession | null> {
  if (token) {
    const row = (
      await db.select().from(sessions).where(eq(sessions.token, token)).limit(1)
    )[0];
    if (row && row.expiresAt.getTime() > Date.now()) {
      return resolveFromUserId(row.userId);
    }
  }

  // Dev fallback — wired in scripts/seed.ts
  const u = (
    await db.select().from(users).where(eq(users.email, DEV_EMAIL)).limit(1)
  )[0];
  if (!u) return null;
  const resolved = await resolveFromUserId(u.id);
  return resolved ? { ...resolved, isDev: true } : null;
}

async function resolveFromUserId(userId: string): Promise<AuthSession | null> {
  const u = (
    await db.select().from(users).where(eq(users.id, userId)).limit(1)
  )[0];
  if (!u) return null;

  const membership = (
    await db
      .select({
        orgId: orgMembers.orgId,
        role: orgMembers.role,
      })
      .from(orgMembers)
      .where(eq(orgMembers.userId, userId))
      .limit(1)
  )[0];

  if (!membership) return null;

  const o = (
    await db.select().from(orgs).where(eq(orgs.id, membership.orgId)).limit(1)
  )[0];
  if (!o) return null;

  return {
    user: { id: u.id, email: u.email, name: u.name },
    org: { id: o.id, name: o.name, slug: o.slug, plan: o.plan },
    role: membership.role,
    isDev: false,
  };
}

export async function requireSession(token?: string | null): Promise<AuthSession> {
  const s = await getCurrentSession(token);
  if (!s) throw new AuthError("unauthorized");
  return s;
}

export class AuthError extends Error {
  constructor(public readonly code: "unauthorized" | "forbidden" | "expired") {
    super(code);
    this.name = "AuthError";
  }
}
