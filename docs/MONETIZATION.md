# Monetization & GTM

## Honest baseline

The hard truth: nobody owes us money. Federal court dockets are public,
existing tools are entrenched, and "AI for X" is a saturated phrase. The
case for DocketLens is **not** "new market" — it's **price + product**
in an old market.

## Market shape

| Tier | Tool | Annual cost (per seat) | Who actually pays |
|---|---|---|---|
| Enterprise legal AI | Lex Machina, Docket Navigator, Bloomberg Law | $25k–$100k+ | AmLaw 200, F500 in-house |
| Legacy research | Westlaw Edge, Lexis+ | $10k–$30k | Mid-market firms |
| Federal-only PACER | PACER itself | $0.10/page (variable, ~$50–$5k effective) | Everyone, grudgingly |
| Newsroom alerts | Manual + Google Alerts + Twitter | $0 | Reporters |
| Free tools | CourtListener web UI | $0 | Researchers (good but spartan) |

The gap **DocketLens occupies**: roughly $0 → $500/mo, with a UX and AI
layer the enterprise tools won't bother to build because they're locked
into customer success at $25k+ contracts.

## Pricing

| Plan | $/mo | Target buyer |
|---|---|---|
| Free | $0 | Trial, journalists doing ad hoc research, students |
| Pro | $49 | Solo attorneys, freelance researchers, retail investors |
| Team | $199 (5 seats incl, then $25/seat) | Small firms, newsrooms, investment teams |
| Enterprise | "call us" | Eventually — once we've got reference logos |

Rationale, plan-by-plan:

- **Free is the funnel.** 5 watchlists, daily digest, one-line AI
  summaries. Enough to feel the product. Hard cap on history (7 days)
  forces an upgrade conversation if it's load-bearing for you.
- **Pro at $49** is the **one-attorney number** — comparable to a
  single CLE course or a couple of LexisAdvance hourly searches. We
  expect most paid users to land here.
- **Team at $199** is **less than half of one Bloomberg Law seat**
  yet covers the whole firm at 5 included seats. The shared
  watchlists + Slack integration is the wedge.
- **Enterprise** is intentionally vague today. Don't sell it before
  there's something to sell.

## Unit economics (estimate)

Per Pro user, per month:

- COGS:
  - Vercel: ~$0.20 (function invocations are tiny)
  - Neon Postgres: ~$0.10 (shared)
  - CourtListener calls: $0 (within the org's pooled token)
  - Anthropic Claude (cached prompts, ~30 summaries/day at Haiku):
    ~$2.50
  - Resend email: ~$0.05
  - **Total ≈ $3 / paying Pro user.**
- ARPU: $49.
- **Gross margin ≈ 94%.**

Per Team customer (assume 5 seats, 50 watchlists, 10× the AI volume):

- COGS ≈ $25.
- ARPU: $199.
- **Gross margin ≈ 87%.**

Margin compresses if customers use the BYO-token path (they pay for
their own CourtListener calls but cost us more Anthropic calls).
Still, the BYO-token path is *the* premium positioning move — it's
what justifies "real-time alerts."

## Acquisition channels

### Free / earned

1. **r/LawFirm + r/legaltech + r/patentlaw + r/lawschool** — value-add
   posts (not promotional spam): "I built a free PACER tracker, here's
   how to set up your first watchlist." Then answer questions in the
   thread.
2. **Hacker News Show HN** — "Show HN: I made the Bloomberg Terminal
   for federal court dockets." Time it for a Tuesday morning.
3. **LinkedIn from a single profile (yours)** — "build in public" cadence
   for 30 days, screenshots of the dashboard, screenshot of the
   match-to-alert flow.
4. **Newsroom outreach** — DM 10 financial / legal reporters with a
   short personalized note. Offer 6 months free in exchange for
   feedback. **One reporter writeup = a month of organic.**
5. **Twitter — @docketlens** — post one beautifully designed AI-summarized
   filing per day, with the actual case linked. Lawyers will follow.
6. **Indie Hackers** — monthly "build update" post. Free, niche audience.

### Paid (when free isn't enough — expect this to be ~month 3+)

1. **Google search ads** for `PACER alternative`, `Lex Machina free`,
   `federal court alerts`, `Bloomberg Law cheap`. These are
   high-intent, low-CPC keywords.
2. **LinkedIn ads to job titles**: "Litigation Associate", "Investigative
   Reporter", "Equity Analyst" at firms with 5–50 employees.
3. **Sponsorship of legal/finance newsletters** — Above the Law,
   Matt Levine. Pricey but high signal.

Target CAC: <$30 for Pro, <$150 for Team. Both well below 3-month
payback at our gross margin.

## Pricing experiments to run in months 1–3

1. **Anchor "Team" at $399 → step down to $199.** A/B the price page.
2. **Free tier history: 7 days vs 30 days.** Activation vs conversion.
3. **Pro at $49 vs $39 vs $69.** We charge less than we should. Test up.
4. **Annual discount (~20%).** Many SaaS firms run 16.7% off (10 months
   for 12). Test 25% to convert annual aggressively.

## What we will NOT do

- Sell "AI predictions of case outcomes." Lex Machina's whole pitch is
  this, and it's borderline-misleading. Our AI is extractive only.
- Charge per-search like the enterprise tools. That's a tax on use,
  and our cost structure doesn't need it.
- "Contact sales for pricing." Even at Enterprise, we publish a
  starting number ($1,500/mo / $18k/yr) once we have a reference deal.

## Revenue targets (loose)

| Quarter | Target paying customers | Target MRR | Comment |
|---|---|---|---|
| Q1 (launch) | 25 Pro / 0 Team | $1,225 | Friends + early-access list |
| Q2 | 100 Pro / 3 Team | $5,500 | First HN/reddit moment |
| Q3 | 300 Pro / 10 Team | $16,700 | Newsroom writeup, paid-channel kick-in |
| Q4 | 600 Pro / 25 Team | $34,375 | Annual plan launches |
| Year 2 | 1,500 Pro / 100 Team | $93,400 | First enterprise contracts |

These are operator-build hypotheses, not promises. Re-evaluate every
30 days against actual signups + retention.

## Defensibility

Once we're shipping, the moat is:

1. **The pipeline.** Multi-court ingestion + entity resolution + AI
   summarization stack is a 6-month build to recreate.
2. **The data accretion.** Every cached docket entry, every AI
   summary, every entity-graph edge becomes part of our local DB.
   After 12 months the local cache is more useful than CourtListener
   itself for the cases our users care about.
3. **Distribution among lawyers + journalists.** We're not selling
   to enterprise procurement; we're selling to individuals who
   recommend tools to each other. Network effects, slow but real.

## The honest weakness

If CourtListener tightens its rate limit or commercializes its API,
our economics shift. Mitigations:

- BYO-token tier already reduces our exposure for power users.
- We can negotiate a commercial agreement at scale (FLP is a
  nonprofit; they're open to it).
- Worst case — we cut over to scraping RECAP archive files directly,
  which is public-domain content.

Plan for the world we're in, design for the world that might be next.
