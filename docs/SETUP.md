# Production setup — paid service wire-up

DocketLens ships with every external integration env-gated. The
marketing site works with no secrets at all (it reads sample data).
This doc walks through the signups + the one command that wires
everything to Vercel afterwards.

## What's already done

- ✅ Vercel project `docketlens` linked under `ggyanieai-4551s-projects`
- ✅ GitHub repo `ggyanie-ai/docketlens` pushed
- ✅ Production deployment live at https://docketlens-pi.vercel.app
- ✅ Better-Auth runtime wired (defensive — activates with env)
- ✅ vitest suite (135 passing) + CI

## What needs your hand (intrinsically interactive signups)

Each provider requires Google-OAuth signup that the assistant cannot
drive — no REST API exists for "create an account." Five-to-ten
minutes total across all six.

### 1. Neon (Postgres) — required

1. https://neon.tech → **Sign in with Google** → use `ggyanie.ai@gmail.com`.
2. Create a project: name `docketlens`, region `us-east-1`.
3. Copy the **pooled** connection string from the dashboard. It looks
   like `postgresql://user:pass@ep-xxxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`.
4. Save it for step 8 below.

Free tier: 0.5 GB storage, 191.9 compute-hours/mo. Fine forever at indie scale.

### 2. Anthropic — required for AI summaries

1. https://console.anthropic.com → sign in with `ggyanie.ai@gmail.com`.
2. Settings → API Keys → **Create Key**. Name it `docketlens-prod`.
3. Copy the `sk-ant-...` key.

Note: Anthropic API is metered (pay-per-token). Claude Max
subscription does NOT include API access — it's billed separately.

### 3. Resend — required for email digests + magic-link auth

1. https://resend.com → **Sign in with Google** → `ggyanie.ai@gmail.com`.
2. Add the domain `docketlens.ai` (Domains tab) and follow the DNS
   verification steps. Alternatively, use `onboarding@resend.dev` as
   `RESEND_FROM` for testing (Resend's shared sender).
3. API Keys → **Create API Key** → name `docketlens-prod`, scope
   "Sending access". Copy the `re_...` key.

Free tier: 100 emails/day, 3,000/mo.

### 4. CourtListener — required for real docket ingestion

1. https://www.courtlistener.com → **Register** with `ggyanie.ai@gmail.com`.
2. Profile → API → copy the auth token.

Free, no paid tier needed.

### 5. Google OAuth — required for Sign-in-with-Google

1. https://console.cloud.google.com → create a project `docketlens`.
2. APIs & Services → OAuth consent screen → External → fill the minimum.
3. APIs & Services → Credentials → **Create OAuth 2.0 Client ID** → Web app.
4. Authorized redirect URIs: `https://docketlens-pi.vercel.app/api/auth/callback/google`
   (plus `http://localhost:3000/api/auth/callback/google` for dev).
5. Copy the **Client ID** and **Client Secret**.

### 6. Stripe — required only when you take payments

> **Skip this until you actually want to charge people** — it's the
> only line item that brings real risk (compliance, refunds, chargeback
> liability). Touched separately.

## After signups: one-command wire-up

Create a local `.env.production` file with the values you collected:

```dotenv
DATABASE_URL=postgresql://user:pass@ep-xxxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
RESEND_FROM="DocketLens <alerts@docketlens.ai>"
COURTLISTENER_TOKEN=...
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
BETTER_AUTH_URL=https://docketlens-pi.vercel.app
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
DOCKETLENS_WEBHOOK_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_APP_URL=https://docketlens-pi.vercel.app
```

Then:

```bash
# Sanity-check locally first
pnpm preflight

# Push every var to Vercel production env in one go
VERCEL_TOKEN=<your-token> \
VERCEL_TEAM_ID=team_PaM0zp987BRug13fKgAqtgdJ \
VERCEL_PROJECT_ID=prj_0sPTOSGcqFOLIrajgb5EV78ggUSn \
  pnpm setup:prod-env --from-file .env.production

# Apply DB schema to Neon
pnpm db:migrate

# Optional: seed sample data into Neon
pnpm db:seed

# Redeploy with the new env
vercel deploy --prod --yes --token $VERCEL_TOKEN --scope ggyanieai-4551s-projects
```

After this, `/api/health` returns 200 (DB ping succeeds), AI summaries
hit real Claude, email digests actually send, and Sign-in-with-Google
works.

## Domain attach (optional)

Once you're ready to flip `docketlens-pi.vercel.app` for `docketlens.ai`:

1. Point your DNS at Vercel: `A @ 76.76.21.21` (or use the per-team CNAME).
2. `vercel domains add docketlens.ai --scope ggyanieai-4551s-projects`
3. `vercel alias set <prod-deployment-url> docketlens.ai`

The assistant can drive steps 2 + 3 once DNS is pointed.

## Monthly cost ballpark

| Stage                                | $/mo |
| ------------------------------------ | ---- |
| Now (no users)                       | $0   |
| First 50 paying users                | $30–50 |
| 500 active users w/ daily digests    | $150–250 |
| Several thousand users               | $500+ |

Anthropic API + Resend Pro are the dominant variable costs at scale.
