import { z } from "zod";

const ServerEnv = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /* Database */
  DATABASE_URL: z.string().default("file:./docketlens.db"),

  /* CourtListener */
  COURTLISTENER_TOKEN: z.string().optional(),
  COURTLISTENER_BASE_URL: z.string().url().default("https://www.courtlistener.com/api/rest/v4"),

  /* Anthropic Claude */
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL_SUMMARY: z.string().default("claude-haiku-4-5-20251001"),
  ANTHROPIC_MODEL_DEEP: z.string().default("claude-sonnet-4-6"),

  /* Auth */
  BETTER_AUTH_SECRET: z.string().min(16).default("dev-secret-please-change-in-production-min-32-chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  /* Email */
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().default("DocketLens <alerts@docketlens.ai>"),

  /* Billing */
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_TEAM: z.string().optional(),

  /* Observability */
  POSTHOG_KEY: z.string().optional(),
});

const ClientEnv = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
});

function parseServer() {
  if (typeof window !== "undefined") {
    throw new Error("Server env accessed in browser");
  }
  const parsed = ServerEnv.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid server env:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server env");
  }
  return parsed.data;
}

function parseClient() {
  const parsed = ClientEnv.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  });
  if (!parsed.success) {
    console.error("❌ Invalid client env:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client env");
  }
  return parsed.data;
}

export const serverEnv = (() => {
  if (typeof window === "undefined") return parseServer();
  return null as unknown as ReturnType<typeof parseServer>;
})();

export const clientEnv = parseClient();
