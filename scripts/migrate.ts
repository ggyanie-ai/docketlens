import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./docketlens.db";
  const client = createClient({ url });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log(`✓ migrations applied to ${url}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
