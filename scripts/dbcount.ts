import { Pool } from "@neondatabase/serverless";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const c = await pool.query("select count(*)::int as n from courts");
  const d = await pool.query("select count(*)::int as n from dockets");
  const e = await pool.query("select count(*)::int as n from docket_entries");
  const p = await pool.query("select count(*)::int as n from parties");
  console.log(`courts:${c.rows[0].n}  dockets:${d.rows[0].n}  entries:${e.rows[0].n}  parties:${p.rows[0].n}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
