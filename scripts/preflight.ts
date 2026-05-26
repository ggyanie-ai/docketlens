/* ============================================================================
 *  scripts/preflight.ts — env + DB readiness check
 *
 *  Run before a fresh prod cutover to confirm every secret is in place
 *  and the DB connection actually works. Prints a per-service status
 *  matrix and exits non-zero if anything required is missing.
 *
 *  Usage:
 *    pnpm preflight                  # uses local .env
 *    pnpm preflight --vercel         # pulls Vercel env first
 *
 *  Required: DATABASE_URL.
 *  Optional but feature-gating: ANTHROPIC_API_KEY, RESEND_API_KEY,
 *    COURTLISTENER_TOKEN, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID +
 *    GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY.
 * ==========================================================================*/

const REQUIRED = ["DATABASE_URL"] as const;

const FEATURES = [
  {
    name: "AI summaries (Anthropic)",
    vars: ["ANTHROPIC_API_KEY"],
    where: "https://console.anthropic.com/settings/keys",
  },
  {
    name: "Email delivery (Resend)",
    vars: ["RESEND_API_KEY"],
    where: "https://resend.com/api-keys",
  },
  {
    name: "Docket ingestion (CourtListener)",
    vars: ["COURTLISTENER_TOKEN"],
    where: "https://www.courtlistener.com/profile/api/",
  },
  {
    name: "Magic-link auth (Better-Auth)",
    vars: ["BETTER_AUTH_SECRET", "RESEND_API_KEY"],
    where: "generate 32+ chars; set in Vercel env",
  },
  {
    name: "Google OAuth (Better-Auth)",
    vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    where: "https://console.cloud.google.com/apis/credentials",
  },
  {
    name: "Stripe billing",
    vars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    where: "https://dashboard.stripe.com/apikeys",
  },
] as const;

function pad(s: string, n: number) {
  return s + " ".repeat(Math.max(0, n - s.length));
}

async function pingDb(): Promise<{ ok: boolean; error?: string; latencyMs: number }> {
  const t0 = performance.now();
  try {
    const [{ sql }, { db }] = await Promise.all([
      import("drizzle-orm"),
      import("../src/lib/db"),
    ]);
    await db.run(sql`select 1`);
    return { ok: true, latencyMs: Math.round(performance.now() - t0) };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - t0),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  let failed = false;

  // Required
  console.log("Required\n--------");
  for (const k of REQUIRED) {
    const has = !!process.env[k];
    console.log(`${has ? "ok   " : "MISS "} ${pad(k, 28)} ${has ? "present" : "missing — set this first"}`);
    if (!has) failed = true;
  }

  // DB liveness
  if (process.env.DATABASE_URL) {
    const r = await pingDb();
    console.log(
      `${r.ok ? "ok   " : "FAIL "} ${pad("DB connect", 28)} ${r.ok ? `${r.latencyMs} ms` : r.error}`
    );
    if (!r.ok) failed = true;
  }

  // Optional features
  console.log("\nFeatures\n--------");
  for (const f of FEATURES) {
    const missing = f.vars.filter((v) => !process.env[v]);
    if (missing.length === 0) {
      console.log(`ok    ${pad(f.name, 32)} all ${f.vars.length} vars present`);
    } else {
      console.log(`off   ${pad(f.name, 32)} missing: ${missing.join(", ")}  →  ${f.where}`);
    }
  }

  if (failed) {
    console.log("\nPreflight failed — at least one required env is missing or broken.");
    process.exit(1);
  } else {
    console.log("\nPreflight passed.");
  }
}

main().catch((err) => {
  console.error("preflight crashed:", err);
  process.exit(2);
});
