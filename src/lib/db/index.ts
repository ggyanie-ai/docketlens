import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

/* ============================================================================
 *  Postgres (Neon) client
 *
 *  Uses Neon's serverless driver so cold-start cost is minimal under
 *  Vercel's per-request execution model. The pool is cached on
 *  globalThis in non-production so HMR / repeated module loads don't
 *  open new connections.
 *
 *  DATABASE_URL must be the **pooled** Neon connection string (host
 *  includes `-pooler`); the serverless driver requires that.
 * ==========================================================================*/

const globalForDb = globalThis as unknown as {
  __neonPool?: Pool;
};

const pool =
  globalForDb.__neonPool ??
  new Pool({ connectionString: serverEnv.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__neonPool = pool;
}

export const db = drizzle(pool, {
  schema,
  logger: process.env.DB_LOG === "1",
});

export { schema };
export type Db = typeof db;
