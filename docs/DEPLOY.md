# Deployment — Tuesday runbook

This is the step-by-step we run together on Tuesday evening to take
DocketLens from "code-complete + local" to "production at docketlens.ai".

Estimated wall-clock: **90–120 minutes** including DNS propagation.

## Pre-flight checks

```bash
cd ~/projects/docketlens
pnpm install
pnpm typecheck     # must be clean
pnpm db:migrate
pnpm db:seed       # local sanity
pnpm dev           # confirm http://localhost:3000 renders
```

All four must pass before we move on. They do today.

## 1. Provision Postgres (Neon, free tier)

Why Neon: cheapest serverless Postgres, generous free tier (3 GB
storage / 10 GB transfer), branchable databases for preview deploys.

- Create an org-scoped project at <https://console.neon.tech>.
- Create database `docketlens_prod`.
- Copy the **pooled connection string** (the `-pooler` host).
- Set `DATABASE_URL` in `.env.production.local` to that string.

Edit `drizzle.config.ts` to switch `dialect: "sqlite"` → `dialect:
"postgresql"` once production-bound. Drizzle's generated SQL is
mostly portable; the only adjustments:

- `(unixepoch('now') * 1000)` → `extract(epoch from now()) * 1000`
- `integer ... mode: "boolean"` → `boolean`

Run:

```bash
DATABASE_URL=... pnpm db:generate   # regenerate for postgres
DATABASE_URL=... pnpm db:migrate
```

## 2. Domain

- Buy `docketlens.ai` on Vercel or Namecheap.
- If Namecheap: add CNAME records → `cname.vercel-dns.com`.
- Vercel auto-issues TLS via Let's Encrypt.

## 3. Vercel project

```bash
cd ~/projects/docketlens
vercel link --yes                 # link this folder to a new Vercel project
vercel env add DATABASE_URL production
vercel env add COURTLISTENER_TOKEN production
vercel env add ANTHROPIC_API_KEY production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production         # https://docketlens.ai
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM production             # DocketLens <alerts@docketlens.ai>
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRICE_PRO production
vercel env add STRIPE_PRICE_TEAM production
vercel env add NEXT_PUBLIC_APP_URL production     # https://docketlens.ai
vercel --prod
```

Repeat the env adds for **preview** environments so PR deploys can
talk to a Neon branch.

## 4. CourtListener token

- Sign up at <https://www.courtlistener.com/sign-in/>.
- Copy the API token from <https://www.courtlistener.com/profile/api-token/>.
- Drop into `COURTLISTENER_TOKEN`.
- Rate limit reminder: 5/min, 50/hr, 125/day. The client respects all
  three.

## 5. Anthropic API key

- Create a production key at <https://console.anthropic.com>.
- Drop into `ANTHROPIC_API_KEY`.
- Default models are pinned in env:
  - summary tier:  `claude-haiku-4-5-20251001`
  - exec tier:     `claude-sonnet-4-6`
- Prompt caching is already wired — the system block is ephemeral-cached.

## 6. Resend (alert email)

- Add `docketlens.ai` as a sending domain.
- Add the SPF + DKIM records Resend prints to Namecheap/Vercel DNS.
- Wait for verification (5–15 min).
- Copy the API key into `RESEND_API_KEY`.
- `RESEND_FROM` should be `DocketLens <alerts@docketlens.ai>` post-verify.

## 7. Stripe (billing)

- Switch to **Live mode** in the Stripe dashboard.
- Create three products: **Pro** ($49/mo), **Team** ($199/mo + $25/seat),
  **Enterprise** (call-us).
- Copy each price ID into the matching env var.
- Create a webhook endpoint at `https://docketlens.ai/api/webhooks/stripe`
  for events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 8. Ingestion worker

Two viable hosts; pick whichever's smoother for you:

### Option A — Fly machine (recommended)

```bash
fly launch --name docketlens-ingest --no-deploy
# Edit fly.toml: set [processes] worker = "node --import tsx scripts/ingest.ts"
fly secrets set DATABASE_URL=… COURTLISTENER_TOKEN=… ANTHROPIC_API_KEY=… RESEND_API_KEY=…
fly machine run --schedule=hourly docketlens-ingest
```

### Option B — GitHub Actions cron

`.github/workflows/ingest.yml` (already templated below in this repo):

```yaml
name: ingest
on:
  schedule:
    - cron: "23 * * * *"     # every hour at :23
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 12
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm ingest --since=2h
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          COURTLISTENER_TOKEN: ${{ secrets.COURTLISTENER_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

## 9. Smoke tests (post-deploy)

```bash
# Pages
curl -sI https://docketlens.ai/ | head -3
curl -sI https://docketlens.ai/dashboard | head -3

# API discovery (unauth)
curl -s https://docketlens.ai/api/v1 | head -c 400

# API auth check (should 401)
curl -sI https://docketlens.ai/api/v1/dockets | head -3

# DB shape
DATABASE_URL=… pnpm exec drizzle-kit introspect:pg
```

## 10. Soft launch (week 1)

- Tweet "early-access live, free tier, no card." Link to /signup.
- Cross-post on Indie Hackers + r/legaltech.
- Slack DM 5 attorneys + 5 reporters with their profile-shaped pitch.

## Rollback

We deploy via Vercel's git integration — rollback is one click in the
Vercel dashboard or:

```bash
vercel rollback https://docketlens.ai
```

DB migrations are forward-only by Drizzle convention; if a migration
goes bad, restore from Neon's automatic PITR (point-in-time recovery).

## What if things go sideways during launch

- CourtListener rate-limit pain → flip ingestion to a per-watchlist
  schedule and rely on cached data for the rest.
- Anthropic outage → AI summaries gracefully degrade to the
  one-line `short` field; UI doesn't break.
- Resend down → queued deliveries stay queued; auto-retry on next
  worker pass.
- Neon spike → Vercel functions backoff; user-facing pages remain
  cached and readable.
