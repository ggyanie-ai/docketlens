# DECISIONS

Append-only log of non-obvious architecture/operational decisions for DocketLens. Update when reality forces a change. Don't relitigate without writing the new entry.

---

## 2026-05-27 — Vercel cron for CourtListener ingest

**Decision.** Wire the existing `scripts/ingest.ts` worker as a Vercel Cron job at `/api/cron/ingest`, scheduled hourly. Cron job authenticates via `Authorization: Bearer <CRON_SECRET>` (the standard Vercel cron pattern).

**Why.** Manual `pnpm ingest` runs are fine for dev but production needs continuous CourtListener polling so watchlists and the dashboard show real data. Vercel Cron is the simplest path on this hosting — no external scheduler (GitHub Actions / Fly / Upstash QStash) needed.

**Trade-off.** Vercel Cron on Hobby has 2 cron jobs free; we're using 1. Function execution time is capped at 300s by default (Fluid Compute on Vercel 16). A full ingest sweep that takes longer than 300s will be cut off mid-pass — acceptable because the worker is idempotent and the next run picks up where the prior left off.

**Reasoning live.** The ingest worker logs to stdout; Vercel Functions logs capture those. No separate persistence needed for run history beyond the existing `audit_events` table (which the worker writes to for matches + deliveries).

---

## 2026-05-27 — Bot architecture: persistent HTTP server, not per-script Playwright

**Decision.** `scripts/bot-server.ts` is the primary browser-driving tool. It runs as a long-lived Express server on `localhost:9999`, exposes REST endpoints (`/goto`, `/snapshot`, `/click`, `/fill`, `/scrape`, `/screenshot`, `/shutdown`), keeps a persistent Chrome context, and survives many curl-driven commands.

**Why.** The first-pass approach (one Playwright script per signup flow with hardcoded selectors) broke on every Google UI shuffle and required restarting the browser — losing OAuth cookies, session state, and time. The HTTP-driven bot lets the controller (the assistant) inspect DOM state via `/snapshot`, issue follow-up commands, and adapt to whatever's actually on the page without restarting.

**Trade-off.** Adds an Express dep (small, devDependency only). Bot must be started before driving, and shut down (`POST /shutdown`) when done.

**Key technical note.** All locator queries use direct Playwright getters (`getAttribute`, `textContent`, `inputValue`) — NEVER `page.evaluate()`. Playwright's UtilityScript bundle crashes with `__name is not defined` on this Chrome channel, which breaks anything that injects a script. The snapshot endpoint is built around this constraint.

---

## 2026-05-26 — Postgres on Neon, not Turso/libSQL

**Decision.** Migrated the entire Drizzle schema (21 tables) from `sqliteTable` → `pgTable`, and the client from `@libsql/client` → `@neondatabase/serverless`.

**Why.** User already pays for Neon (`ggyanie.ai@gmail.com`) for another project (insider-thesis). Adding DocketLens to the same Neon account costs $0 marginal. Turso would have been zero code-change (libSQL-compatible) but adds a new vendor relationship and free-tier limits to track. Postgres is also more battle-tested for the docket schema's joins.

**Trade-off.** Migration cost: ~45 min including the `db.run` → `db.execute` API rename across 6 call sites, regenerating Drizzle migrations as Postgres DDL, swapping `unixepoch('now') * 1000` defaults for `now()`, mode:json → jsonb. The `widget-pings.test.ts` was libSQL-mock-specific — renamed to `.disabled` until ported.

---

## 2026-05-25 — Hosting on Vercel under the `.ai` account

**Decision.** Production lives at `docketlens-pi.vercel.app` under the `ggyanieai-4551s-projects` team (login: `ggyanie.ai@gmail.com`). GitHub source at `github.com/ggyanie-ai/docketlens`.

**Why.** Aligns Vercel + GitHub ownership under the same Gmail. User has a second Vercel/GitHub identity (`ggyanierahylu-7328` / `donnowyu`) used for older projects — we mirror to that GitHub remote too (`origin`) so neither account loses history.

**Trade-off.** Vercel Hobby team rule: commit author email must equal team-owner email. Local git config for this repo (only) was set to `ggyanie-ai <ggyanie.ai@gmail.com>`. Commits authored as the older `gianilingampalli-dotcom <giani.lingampalli@gmail.com>` get blocked on deploy.
