<div align="center">

# DocketLens

**The Bloomberg Terminal for federal court dockets — beautifully designed, AI-summarized, and priced for humans.**

[Live demo](#) · [Pricing](./docs/MONETIZATION.md) · [Architecture](./docs/ARCHITECTURE.md) · [Deploy](./docs/DEPLOY.md) · [API](./docs/API.md)

</div>

---

## Why it exists

Federal court dockets are public records. They're also one of the most undermonetized signal sources on the internet — material litigation moves stocks, breaks news cycles, and changes M&A outcomes, but the tools to watch them are either:

1. **Free and unusable** (PACER — $0.10/page, 1995 UX, no alerts), or
2. **Excellent and unaffordable** (Lex Machina, Docket Navigator, Bloomberg Law — $25k–$100k+/yr).

There's nothing in the middle. **DocketLens is the middle.** Beautiful product, fair pricing, real AI, public data.

## Who it's for

| Persona | What DocketLens replaces |
|---|---|
| Solo & small-firm litigators | Manual PACER scrolling each morning |
| Reporters & investigators | "Set a Google alert and hope" |
| Investors & analysts | Reading EDGAR for litigation hints |
| Corporate legal & compliance | The intake fire drill |

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript** strict
- **Tailwind v4** + custom OKLCH design tokens
- **Drizzle ORM** on libSQL (SQLite local · Postgres prod)
- **Anthropic Claude** for tiered extractive summaries (Haiku 4.5 → Sonnet 4.6)
- **CourtListener REST v4** (Free Law Project) as the upstream data source
- **Better-Auth** for sessions, magic links, Google OAuth
- **Resend** for digest emails
- **Stripe** for billing (Pro $49/mo · Team $199/mo)

## Quickstart

```bash
pnpm install
cp .env.example .env.local
# fill in COURTLISTENER_TOKEN and ANTHROPIC_API_KEY for real data
pnpm db:migrate
pnpm dev
```

Then open <http://localhost:3000>.

## Project layout

```
src/
  app/                Next.js App Router
    (marketing)/      Landing, pricing, FAQ, docs (public)
    (app)/            Authenticated app shell (sidebar)
    api/              Public REST + webhooks
  components/         UI + marketing sections
  lib/
    db/               Drizzle schema, client, IDs
    courtlistener/    Typed CL REST v4 client (rate-limited)
    ai/               Claude summarization (versioned prompts)
    auth/             Better-Auth setup
    alerts/           Alert rule engine + delivery
scripts/              CLI utilities (migrate, seed, ingest)
drizzle/migrations/   Generated SQL
docs/                 ARCHITECTURE, DEPLOY, MONETIZATION, API
```

## Status

Pre-1.0 — solo build, in active development. The architecture is settled; product surface is being built out in the open.

## License

Source-available, all rights reserved (for now). Public-docket data sourced from CourtListener under their permissive terms. Not legal advice.

— Built with care for lawyers, journalists, and investors.
