import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users, sessions, accounts, verifications } from "@/lib/db/schema";
import { serverEnv } from "@/lib/env";

/* ============================================================================
 *  Better-Auth runtime
 *
 *  Wired defensively — every external dependency is env-gated:
 *
 *    - Email magic-link only mounts when RESEND_API_KEY is present.
 *    - Google OAuth only mounts when both GOOGLE_CLIENT_ID and
 *      GOOGLE_CLIENT_SECRET are present.
 *
 *  Without any provider env vars set, the auth surface exposes the
 *  base session/sign-out routes but no way to actually sign in — which
 *  is the right behavior for a fresh prod cutover before secrets land.
 *
 *  The Drizzle adapter maps onto the existing `users / sessions /
 *  accounts / verifications` tables (already shaped for Better-Auth
 *  conventions in src/lib/db/schema.ts), so no migration is required.
 * ==========================================================================*/

const haveGoogle = Boolean(
  serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
);
const haveResend = Boolean(serverEnv.RESEND_API_KEY);

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),

  user: {
    additionalFields: {
      // Mirror the existing `role` column on users so admin routes can read it.
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  emailAndPassword: {
    // Magic-link replaces password; never enabled.
    enabled: false,
  },

  socialProviders: haveGoogle
    ? {
        google: {
          clientId: serverEnv.GOOGLE_CLIENT_ID!,
          clientSecret: serverEnv.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},

  plugins: haveResend
    ? [
        // Magic-link via Resend. Lazy import so a missing peer dep can't
        // crash module load when the env var is absent.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        (require("better-auth/plugins").magicLink as typeof import("better-auth/plugins").magicLink)({
          sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(serverEnv.RESEND_API_KEY!);
            await resend.emails.send({
              from: serverEnv.RESEND_FROM,
              to: email,
              subject: "Sign in to DocketLens",
              text: `Click to sign in:\n\n${url}\n\nThis link expires in 15 minutes.`,
            });
          },
          expiresIn: 60 * 15,
        }),
      ]
    : [],
});

/** Provider-availability flags for UI gating (the /login page reads these). */
export const authProviders = {
  google: haveGoogle,
  magicLink: haveResend,
};
