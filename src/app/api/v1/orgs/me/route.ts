import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orgs } from "@/lib/db/schema";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/orgs/me
 *
 *  Thin alias for the org subset of /api/v1/me. Callers that already
 *  have the key info but want just the org details — and don't want
 *  to deserialize the verbose me payload — hit this instead.
 *
 *  Returns: { id, name, slug, plan, stripe_customer_id (Team+
 *  only — null otherwise) }
 * ==========================================================================*/

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const [row] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.id, auth.orgId))
    .limit(1);
  if (!row) return err("org not found", 404);

  const teamPlus = auth.plan === "team" || auth.plan === "enterprise";

  return ok(
    {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      stripe_customer_id: teamPlus ? row.stripeCustomerId ?? null : null,
      created_at: row.createdAt?.toISOString() ?? null,
    },
    { headers: { "cache-control": "private, max-age=60" } }
  );
}
