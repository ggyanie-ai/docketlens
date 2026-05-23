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
