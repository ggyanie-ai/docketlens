# Operational runbook

What to do when things break in production.

## On-call alerts (set up Tuesday)

We're a single-operator project — for now, the "on-call rotation" is
"GG's phone." Alerts route through:

- **Sentry** → Slack `#alerts` channel (TODO: install Tuesday)
- **Vercel deploy failures** → email
- **Resend bounce rate >2%** → email
- **Stripe failed payments** → email
- **Neon storage >70% of quota** → email

## Common breakages and fixes

### Symptom: dashboard shows "0 watchlists" for an authed user

Likely cause: `getCurrentSession()` returned `null` because the
session token expired or the user/org rows are missing.

Steps:

1. Tail Vercel logs for `AuthError`.
2. Check Neon: `SELECT * FROM sessions WHERE token = '…';`.
3. If empty: the user signed out elsewhere. Force a re-login.

### Symptom: no new alerts being generated

Likely cause: the ingestion worker stopped running.

Steps:

1. Check Fly machine status: `fly status -a docketlens-ingest`.
2. Check the most recent `audit_events` row of action='ingest.complete'.
3. If >2h old, restart: `fly machine restart -a docketlens-ingest`.
4. If still failing, run locally to inspect:
   ```bash
   DATABASE_URL=… COURTLISTENER_TOKEN=… pnpm ingest --since=2h
   ```

### Symptom: CourtListener 429s in logs

Likely cause: we burned our 125/day quota.

Steps:

1. Confirm via the `x-ratelimit-*` headers on the failing response.
2. Disable the realtime cadence on the noisiest watchlists.
3. Email FLP about a commercial agreement if this is a regular event.

### Symptom: AI summaries failing

Likely cause: ANTHROPIC_API_KEY rotated or quota exhausted.

Steps:

1. Check the Anthropic console for the key's status.
2. Verify the model IDs in env (`ANTHROPIC_MODEL_SUMMARY`,
   `ANTHROPIC_MODEL_DEEP`) are still active.
3. Summaries gracefully fall back to placeholder text in UI — no
   user-visible 500s.

### Symptom: Resend deliveries piling up as `queued`

Likely cause: `RESEND_API_KEY` invalid or domain unverified.

Steps:

1. Check Resend dashboard for delivery failures.
2. Re-verify SPF/DKIM at the DNS host.
3. Once fixed, `pnpm exec tsx -e "import('./src/lib/alerts/dispatch').then(m => m.flushDeliveries())"` to flush the queue.

### Symptom: Stripe webhook signature failures

Likely cause: `STRIPE_WEBHOOK_SECRET` mismatch.

Steps:

1. Copy the active signing secret from Stripe → Developers → Webhooks.
2. Update Vercel env (`STRIPE_WEBHOOK_SECRET`).
3. Redeploy.

## Maintenance windows

- **Sundays 0200–0400 UTC**: rolling deploys allowed.
- **Quarter-end last week**: avoid schema changes — month/quarter
  rollover queries are heavy.

## Backups

- Neon auto-PITR retains 7 days for free tier.
- Drizzle migrations live in git — schema is reproducible from main.
- Manual snapshot before any destructive migration:
  ```
  pg_dump $DATABASE_URL --schema-only > schema-$(date +%F).sql
  ```

## Cost surveillance

Open the following dashboards weekly:

- Vercel usage
- Neon storage + compute
- Anthropic spend
- Resend volume
- Stripe MRR (for delight, not panic)

Trigger a "talk to ops" moment if any single line item exceeds **3×
month-over-month**.

## Lazy side-tables

Four ops-flavor tables intentionally live OUTSIDE the Drizzle
schema/migration pipeline and lazy-create via `CREATE TABLE IF
NOT EXISTS` on first request. They're decoupled because the data
is throwaway aggregate, not user-facing state, and we don't want
their growth tied to user-data migration coordination.

| Table | Source file | Grain | Growth |
| --- | --- | --- | --- |
| `widget_pings` | `src/lib/widget-pings.ts` | `(docket_id, day, count)` | one row per docket per day. ~365 rows per docket per year. |
| `not_found_pings` | `src/app/api/log-404/route.ts` | `(path, day, count)` | one row per unique 404 path per day. |
| `ai_summary_refresh_queue` | `src/app/api/v1/dockets/[id]/ai-summaries/refresh/route.ts` | one row per refresh request | bounded by the 60s per-docket cooldown. |
| `docket_notes` | `src/app/api/v1/dockets/[id]/notes/route.ts` | one row per `(org_id, docket_id)` | user-data — never auto-truncate. |

### Inspection

```
sqlite3 docketlens.db
SELECT * FROM widget_pings ORDER BY count DESC LIMIT 20;
SELECT path, SUM(count) FROM not_found_pings GROUP BY path ORDER BY 2 DESC LIMIT 20;
SELECT status, COUNT(*) FROM ai_summary_refresh_queue GROUP BY status;
```

### Truncation policy

None today. When any of the first three tables passes 1 GB, set
up a nightly cron that drops rows older than 90 days. Never
auto-truncate `docket_notes`.

### Migrating to Postgres on Tuesday

Run `drizzle-kit generate` AFTER the app has hit the lazy
`CREATE TABLE` paths at least once. Otherwise the generated
migration won't know about the side-tables and they'll be
re-created in Postgres without indexes (correct, but inefficient
for reads).

## On-call quick recipes

- **Check `/api/health` from the CLI**:
  ```
  curl -s https://docketlens.ai/api/health | jq
  ```
  `checks.cl_pool.remaining.per_day` shows pool saturation.

- **Invalidate the AI prompt cache** after a prompt bump: edit
  `PROMPT_VERSION` in `src/lib/ai/prompts.ts` (date.v# format),
  deploy. Old cache rows become `stale: true` automatically;
  fresh summaries regenerate on next view.

- **Rotate an API key**: in the app, Settings → API keys →
  revoke. Server-side, the row's `revoked_at` is set;
  subsequent requests with that token return 401.

- **Force a webhook redelivery**: stubbed today — Retry button
  on /alerts is wired UI-side but the worker that consumes
  `alert_deliveries WHERE status = 'failed'` lands Tuesday.
