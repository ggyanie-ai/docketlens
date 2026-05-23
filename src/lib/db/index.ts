import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __libsql?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.__libsql ??
  createClient({
    url: serverEnv.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__libsql = client;
}

export const db = drizzle(client, { schema, logger: process.env.DB_LOG === "1" });

export { schema };
export type Db = typeof db;
