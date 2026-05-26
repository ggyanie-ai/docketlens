import { auth } from "@/lib/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  /api/auth/[...all] — Better-Auth catch-all
 *
 *  Mounts the full Better-Auth route surface (sign-in, sign-out,
 *  callbacks, session, oauth/google, magic-link/...) under /api/auth/*.
 *  See src/lib/auth/better-auth.ts for which providers are active
 *  based on env presence.
 * ==========================================================================*/

const { POST, GET } = toNextJsHandler(auth);

export { POST, GET };
