# Changelog

We track changes by ISO date (UTC). Stable shipping starts at 1.0.0.

## 0.1.0 — 2026-05-23 (private beta)

Initial private beta. Code-complete, not yet wired to production
infrastructure.

### Added

- **Marketing site** — landing, pricing comparison, FAQ, auth pages.
- **Authenticated app shell** — sidebar + topbar + theme toggle +
  account menu + pinned watchlists.
- **Dashboard** — KPIs, 30-day activity chart, recent filings feed
  with AI summary previews.
- **Search** — faceted by court, NOS code, case type, scope tabs.
- **Docket detail** — case header, parties + judges sidebar,
  timeline of entries with tiered AI summaries (one-line, paragraph,
  exec-brief CTA).
- **Watchlists** — card grid + 4-step guided creation flow with
  entity types (party, attorney, judge, law firm, case, term),
  court + NOS filters, alert cadence.
- **Alerts** — delivery channels (email, webhook, in-app), 30-day
  delivery history with status badges, filter tabs.
- **Settings** — profile, organization, billing, notifications,
  integrations, security tabs.
- **API keys** — Team-gated key list with reveal + copy + revoke.
- **REST API v1** — discovery, dockets list/detail, search,
  watchlists list/create. Bearer-token auth, CORS-enabled, JSON.
- **Drizzle schema** (21 tables) — users/orgs/auth, cached court
  entities, watchlists + matches, alert rules + deliveries, AI
  summaries, API keys, audit log.
- **CourtListener client** — typed, zod-validated, per-token leaky
  bucket rate limiter (5/min, 50/hr, 125/day), 429 retry with
  Retry-After.
- **AI summarization** — versioned extractive prompts, three tiers,
  prompt-cached system block, graceful stub without API key.
- **Alert engine** — deterministic matcher (party / attorney /
  judge / lawfirm / case / term), digest renderer (plain + HTML),
  dispatcher (Resend / webhook / in-app).
- **Ingestion worker** — `scripts/ingest.ts` for hourly/daily refresh
  with idempotent persistence.
- **Seeder** — populates a local SQLite with five sample dockets
  for UI dev.
- **Docs** — ARCHITECTURE, DEPLOY, MONETIZATION, API, RUNBOOK.

### Known gaps (Tuesday wire-up)

- Better-Auth runtime adapter is stubbed; schema is ready.
- Stripe checkout + webhook endpoint TODO.
- Cache Components (`'use cache'`) not enabled yet.
- No live deploy — code-only per the green-light scope.

## Versioning

We follow [semver](https://semver.org) once we ship 1.0. Until then,
0.x.y minor bumps are breaking-allowed and patch bumps are not.
