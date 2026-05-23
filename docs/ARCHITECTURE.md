# Architecture

DocketLens is a Next.js 16 monolith with a typed data pipeline on the side.
Everything runs as serverless functions on Vercel except the **ingestion
worker**, which is a long-running Node process (Fly machine, GH Actions
cron, or a small EC2). This separation lets us respect CourtListener's
strict 125-req/day rate limit without blowing it out on user-facing
traffic.

## 30,000 ft

```
                ┌────────────────────────────────────────┐
                │              docketlens.ai             │
                │   Next.js 16 (App Router, RSC, edge)   │
                └────────────────────────────────────────┘
                  │                │                │
   (browser ←)    │                │                │     ← (3rd-party API consumers)
                  ▼                ▼                ▼
        ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
        │ Marketing  + UI│ │  REST API v1   │ │ Webhooks (in)  │
        └────────────────┘ └────────────────┘ └────────────────┘
                  │                │                │
                  └────────┬───────┴────────┬───────┘
                           ▼                ▼
                    ┌─────────────┐   ┌──────────────┐
                    │  Postgres   │   │  Resend SMTP │
                    │  (Neon)     │   │              │
                    └─────────────┘   └──────────────┘
                           ▲
                           │
                ┌──────────┴──────────┐
                │  Ingestion worker   │
                │  scripts/ingest.ts  │ — Fly machine, hourly cron
                └──────────┬──────────┘
                           │
                           ▼
                ┌────────────────────────┐
                │  CourtListener REST v4 │
                │  (Free Law Project)    │
                └────────────────────────┘
```

## Layers

### 1. Data source — CourtListener REST v4

We do not poll PACER. We ride on **RECAP** (the Free Law Project's mirror
of public PACER content) via the CourtListener REST API. Pros:

- Free, no contract.
- Already covers ~all federal districts + circuits.
- New uploads from PACER appear within minutes of upload to RECAP.

Cons / constraints:

- Rate limit: **5 req/min, 50 req/hr, 125 req/day per API token.**
- Some dockets are RECAP-stale (the public copy is hours behind PACER).
  For Team-plan customers who need faster-than-RECAP, we expose **BYO
  CourtListener token**, which lets them spend their own quota on their
  own watchlist refresh.

Our client (`src/lib/courtlistener/client.ts`) wraps these endpoints with
a leaky-bucket rate limiter, exponential-backoff retry on 429, and
zod-validated responses.

### 2. Cache layer — Postgres (Drizzle)

Every CourtListener response is persisted into our DB. We never re-hit
the API for data we already have. The schema (`src/lib/db/schema.ts`)
mirrors the relevant CL entities, with our own surrogate IDs:

- `dockets`            — case-level cache (case name, court, NOS, judge)
- `docket_entries`     — every filing on every cached docket
- `parties` / `attorneys` / `judges` — extracted entities
- `watchlists` + `watchlist_matches`  — user intent + materialized hits
- `alert_rules` + `alert_deliveries`  — outbound notifications
- `ai_summaries`       — versioned, content-hash-keyed
- `api_keys`           — hashed tokens for the public REST API
- `users` / `orgs` / `accounts` / `sessions` — Better-Auth surface
- `audit_events`       — SOC2-ready trail

Local dev uses libSQL (file:./docketlens.db). Production points
`DATABASE_URL` at Neon Postgres — the schema is dialect-portable except
for a couple of `unixepoch()` defaults which migrate cleanly.

### 3. Ingestion worker

`scripts/ingest.ts` is the heart of the freshness pipeline. It runs on
a cron (default hourly):

1. Refresh the `courts` list.
2. For each active watchlist, pull a windowed slice of recent dockets
   matching its filters.
3. For each new docket, fetch entries + parties.
4. Persist with `onConflictDoNothing` (idempotent — safe to overlap).
5. Hand off to `src/lib/alerts/engine.ts`:
   - `materializeMatches()` — write to `watchlist_matches`
   - `buildDigests({ cadence: 'hourly' })` — render emails, enqueue
   - `flushDeliveries()` — send via Resend / webhook

This worker is **the only component that talks to CourtListener.** The
web app reads from Postgres only.

### 4. Alert engine

Deliberately deterministic — no fuzzy ML in the hot path. Matching is
explainable so users can debug why a watchlist hit (or didn't):

1. Filter gates first (court, NOS code, date window).
2. Lookup by entity type (party, attorney, judge, law firm, case, term).
3. Three match precedences: exact normalized → token-subset →
   substring (5+ chars).

AI lives strictly downstream of matching: once a hit lands, we
summarize the filing into `ai_summaries`. Summaries are versioned by
`PROMPT_VERSION` — bumping the prompt forces regeneration on next read.

### 5. AI summarization

`src/lib/ai/*` wraps the Anthropic SDK with three tiers:

- `one_liner` — Claude Haiku, ~32 words, free + paid tiers
- `paragraph` — Claude Haiku, ~110 words, Pro+
- `exec` — Claude Sonnet, ~250 words, Pro+

The system prompt is **stable and large** — prompt-cached via the
ephemeral `cache_control` block. We pin the prompt with `PROMPT_VERSION`
so all summaries are reproducible.

### 6. Web app

- Marketing routes under `src/app/(marketing)` — landing, pricing,
  docs, FAQ. Eligible for `'use cache'` once `cacheComponents` is
  enabled.
- App routes under `src/app/(app)` — sidebar shell, dashboard, search,
  docket detail, watchlists, alerts, settings, API keys. Authenticated.
- Auth routes under `src/app/(auth)` — login, signup, magic-link
  callback.
- REST API under `src/app/api/v1/*` — bearer-token auth, JSON.

### 7. Auth (Better-Auth, Tuesday wire-up)

Schema is in place; the runtime adapter is stubbed in `src/lib/auth`
because we want to plug Better-Auth in once with the real Postgres
connection. The dev fallback resolves a session for
`ggyanie.ai@gmail.com` so the app shell stays interactive during
development.

API-key auth is independent of session auth — they share the same
`apiKeys` table with hashed tokens and scope arrays.

### 8. Billing (Stripe, Tuesday wire-up)

The `orgs` table carries `stripe_customer_id` + `stripe_subscription_id`.
Three price IDs (Pro / Team / Enterprise placeholder) live in env vars.
The webhook endpoint at `/api/webhooks/stripe` (TODO) updates the
`plan` field on the org, which gates feature access throughout the app.

## Performance characteristics

| Operation                  | Target | Floor |
|----------------------------|--------|-------|
| Landing page (SSG-able)    | <100ms TTFB | <300ms |
| Dashboard initial render   | <800ms | <1.5s |
| Search faceted query       | <200ms p50, <600ms p95 | <1s |
| Docket detail              | <300ms p50 | <800ms |
| REST API hit (cached)      | <80ms | <200ms |
| Watchlist match → email    | <60s (Pro real-time tier) | <5m |

## Trust + safety

- **Data sources are public.** RECAP archives public PACER content.
  Sealed cases are not in RECAP and never in DocketLens.
- **AI is extractive only.** The system prompt explicitly forbids
  inference, opinion, and predictions. Every summary is reproducible
  from the source.
- **Audit log.** `audit_events` records create/update/delete and login
  events. SOC2-ready when we get there.

## What's NOT here yet (Tuesday wire-up)

- Real Better-Auth runtime (schema is ready, callbacks aren't wired)
- Stripe checkout + webhook (price IDs in env)
- Vercel deployment (CI, env vars, custom domain)
- Resend domain verification
- The ingestion worker's host (Fly machine or GH Actions cron)
- Sentry / PostHog (env vars defined, instrumentation pending)

Everything above is code-complete and locally runnable. The "Tuesday
wire-up" items are infra connections, not engineering blockers.
