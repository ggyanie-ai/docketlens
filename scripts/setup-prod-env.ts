/* ============================================================================
 *  scripts/setup-prod-env.ts — one-shot Vercel env setup
 *
 *  Reads a local `.env.production` or accepts key=value pairs on the
 *  command line, pushes them to the Vercel project for the `production`
 *  target, then redeploys. Skips keys that are already set on Vercel.
 *
 *  Requires VERCEL_TOKEN + the docketlens project linked under .vercel/.
 *
 *  Usage:
 *    pnpm setup:prod-env --from-file .env.production
 *    pnpm setup:prod-env DATABASE_URL=postgres://...
 *
 *  Why bother: a typical `vercel env add` is interactive (prompts for
 *  value, target, env). This batches all of it so the human cost is
 *  exactly one `pnpm setup:prod-env`.
 * ==========================================================================*/

import { readFile } from "node:fs/promises";

const ALLOWED = new Set([
  "DATABASE_URL",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL_SUMMARY",
  "ANTHROPIC_MODEL_DEEP",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "COURTLISTENER_TOKEN",
  "COURTLISTENER_BASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_TEAM",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "POSTHOG_KEY",
  "DOCKETLENS_WEBHOOK_SECRET",
]);

async function vercel(path: string, init?: RequestInit) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN not set");
  const teamId = process.env.VERCEL_TEAM_ID;
  const sep = path.includes("?") ? "&" : "?";
  const url = `https://api.vercel.com${path}${teamId ? `${sep}teamId=${teamId}` : ""}`;
  const r = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  if (!r.ok) {
    throw new Error(`Vercel ${init?.method ?? "GET"} ${path}: ${r.status} ${await r.text()}`);
  }
  return r.json();
}

async function readEnvFile(path: string): Promise<Record<string, string>> {
  const raw = await readFile(path, "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    out[m[1]] = val;
  }
  return out;
}

async function readArgs(args: string[]): Promise<Record<string, string>> {
  let pairs: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--from-file" && args[i + 1]) {
      Object.assign(pairs, await readEnvFile(args[i + 1]));
      i++;
      continue;
    }
    const m = args[i].match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) pairs[m[1]] = m[2];
  }
  return pairs;
}

async function main() {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) throw new Error("VERCEL_PROJECT_ID not set (read it from .vercel/project.json)");
  const pairs = await readArgs(process.argv.slice(2));
  const keys = Object.keys(pairs).filter((k) => {
    if (!ALLOWED.has(k)) {
      console.warn(`skip (not in allowlist): ${k}`);
      return false;
    }
    return true;
  });
  if (keys.length === 0) {
    console.log("No env pairs to apply. Usage:");
    console.log("  pnpm setup:prod-env --from-file .env.production");
    console.log("  pnpm setup:prod-env KEY=value KEY2=value2");
    process.exit(1);
  }

  // Fetch existing env so we can update vs. create.
  const existing = (await vercel(`/v9/projects/${projectId}/env`)) as {
    envs: { id: string; key: string; target: string[] }[];
  };
  const byKey = new Map(existing.envs.filter((e) => e.target.includes("production")).map((e) => [e.key, e.id]));

  for (const key of keys) {
    const value = pairs[key];
    const existingId = byKey.get(key);
    if (existingId) {
      await vercel(`/v10/projects/${projectId}/env/${existingId}`, {
        method: "PATCH",
        body: JSON.stringify({ value, target: ["production"], type: "encrypted" }),
      });
      console.log(`updated  ${key}`);
    } else {
      await vercel(`/v10/projects/${projectId}/env`, {
        method: "POST",
        body: JSON.stringify({ key, value, target: ["production"], type: "encrypted" }),
      });
      console.log(`created  ${key}`);
    }
  }

  console.log("\nApplied. Trigger a redeploy with:");
  console.log(`  vercel deploy --prod --yes --scope $VERCEL_TEAM_SLUG`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
