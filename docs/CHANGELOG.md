# Changelog

We track changes by ISO date (UTC). Stable shipping starts at 1.0.0.

## 0.1.2 — 2026-05-24 (developer surface + syndication)

A second polish pass focused on what surrounds the product: an
OpenAPI-backed API surface, embeddable widgets, three syndication
formats for every public feed, and a few quality-of-life pages
(verifier playground, feeds hub, OPML import). No breaking changes
to anything shipped in 0.1.1.

### Added — API + ops

- **`/api/health`** — liveness probe for uptime monitors. JSON
  payload with `ok / status / service / version / prompt_version /
  ts / uptime_seconds / git_sha / checks { db { ok, latency_ms } }`.
  Single 2-second-timeout DB ping; 200 healthy, 503 degraded.
  HEAD honored. No auth.
- **`/api/v1/openapi.json`** — hand-written OpenAPI 3.1 spec as
  the source of truth for the public REST API. Describes every
  endpoint we ship with named `parameters` + `responses` components,
  schemas for `Error / Discovery / Health / Docket / DocketDetail /
  DocketEntry / Party / SearchResult / Watchlist / CreateWatchlist /
  AiSummaries / AiSummaryTier / WidgetStats`, and per-status
  response envelopes. Compatible with Swagger UI, Redoc, Scalar,
  `openapi-typescript`.
- **`/api/v1/dockets/{id}/ai-summaries`** — tier-gated extractive
  summaries through the public REST API. Free plan → `one_liner`
  only; Pro+ → `paragraph` + `exec`. Each summary carries source
  (`cache` / `demo`), prompt version, model, and a `stale` flag
  set when the cached row is older than the current
  `PROMPT_VERSION`.
- **`/api/widget-stats?id=dkt_…`** — owner-side read for the
  privacy-preserving impression counters. Bearer auth required;
  responds with daily series + window total + grand-total +
  privacy note inline.
- **`/api/widget-ping?id=dkt_…`** — 42-byte transparent GIF
  tracking pixel for the embeddable widget. Records ONLY
  `(docket_id, UTC day, count)` — no IP, no UA, no referrer, no
  cookie. Hard no-store headers so it fires every render.
  Fire-and-forget DB write; pixel never blocks on the upsert.

### Added — embeds + syndication

- **`/widget/[id]`** — iframe-friendly embeddable case card.
  Compact court · case_name · docket_number · filed · judge · NOS ·
  3 recent entries · attribution. Scoped `.docketlens-widget-root`
  CSS so the cascade can't leak from the host page;
  `prefers-color-scheme: dark` honored via `data-theme="auto"`.
  Framing permission set via
  `Content-Security-Policy: frame-ancestors *` in next.config.
- **`/widget` index** — three live iframe previews + per-case
  copy-paste snippets with the attribution + no-tracking promise.
- **`/widget/[id]/json`** — JSON twin of the iframe widget. Same
  data shape, with a strong sha256 ETag (`If-None-Match` →
  304-with-no-body honored in production; Next.js dev mode
  strips the conditional header so the branch only fires under
  `next start` / Vercel). HEAD + OPTIONS verbs supported.
- **`/api/oembed?url=…`** — oEmbed 1.0 JSON discovery. Lets
  Notion, Ghost, WordPress, Slack, Discord auto-unfurl
  `docketlens.ai/demo/dkt_…` pastes into the embeddable widget.
  Discovery `<link rel="alternate" type="application/json+oembed">`
  shipped on every `/demo/[id]` page.
- **Saved-search feeds** — three sibling routes per saved search:
  `/api/v1/saved-searches/{id}/feed.xml` (RSS 2.0),
  `/api/v1/saved-searches/{id}/feed.atom` (Atom 1.0),
  `/api/v1/saved-searches/{id}/feed.json` (JSON Feed 1.1). Same
  query params (`q`, `court`, `nos`, `scope`, `name`, `limit`),
  same result set via the shared `runSearch()` helper. `/feed.xml`
  also content-negotiates: `Accept: application/atom+xml`,
  `Accept: application/feed+json`, or `?format=atom|json` redirect
  (302) to the sibling.
- **Blog + changelog format mirrors** — `/blog/feed.atom`,
  `/blog/feed.json`, `/changelog/feed.atom`, `/changelog/feed.json`
  alongside the existing RSS routes.
- **Site-wide feed auto-discovery** — six `<link rel="alternate">`
  tags emitted inline in root `<head>` (NOT via
  `metadata.alternates.types`, because per-page `alternates`
  replaces the entire block rather than merging). Browser RSS
  plugins and reader auto-detect work from any page.
- **`/feeds`** — single human-readable hub with copy-able URLs for
  every public feed (blog + changelog × RSS/Atom/JSON) and the
  saved-search URL template + a fully-resolved example.
- **`/feeds.opml`** — OPML 2.0 bundle of the canonical RSS feeds
  for one-click import into NetNewsWire, Reeder, Inoreader,
  Feedbin, Vivaldi, Kagi.

### Added — surfaces

- **`/docs/api-reference`** — interactive OpenAPI 3.1 renderer
  built directly from the typed `openapi` object. No Redoc, no
  Scalar, no Stoplight script. Two-pane layout with sticky
  left-rail nav grouped by tag; per-endpoint cards with
  parameters · request body · per-status response schemas ·
  auto-generated curl snippet. `$ref` pointers resolved inline;
  `allOf` merged so `DocketDetail` shows fully.
- **`/tools/verify-webhook`** — client-side HMAC playground.
  Computes HMAC-SHA256 via Web Crypto in the browser and
  constant-time-compares against a pasted signature. Secret never
  leaves the page; no fetch, no logging, no analytics. "Load
  sample" pre-fills the form with a generated matching signature
  so the green path is one click away.
- **Dashboard "your embeds" card** — surfaces the top 5 embedded
  dockets by load count over the last 7 days, plus a 30-day
  grand-total badge. Reads from the new `widget_pings` aggregate
  table; empty-state explains the embeddable widget and links to
  `/widget`.
- **SavedSearchesPanel** — per-row "Copy feed URL" Rss-icon
  button opens a Dropdown menu offering RSS 2.0, Atom 1.0, or
  JSON Feed 1.1. Toast description restates the "treat the URL
  like a secret" warning.

### Changed

- **Site footer** — "Feeds" link added to the Resources column;
  "API reference" retargeted from `/docs/api` (the markdown doc)
  to `/docs/api-reference` (the interactive renderer); duplicate
  Press kit entry removed.
- **Discovery payload** at `/api/v1` now lists the new
  endpoints (`openapi.json`, `health`, `ai-summaries`,
  `widget-stats`, all three saved-search feed formats).
- **Blog post pages** — Engineering-tagged posts end with a
  small accent-soft CTA card pointing to `/docs/api-reference`.
  Non-engineering posts unchanged.

### Privacy

- The widget impression counter stores nothing but
  `(docket_id, day, count)` — no IP, UA, referrer, cookie, or
  session per request. `/api/widget-stats` requires auth to read
  but exposes the privacy promise inline in its `meta` block so
  consumers can quote our exact words.
- `/api/oembed` is CORS-open + cookieless.

## 0.1.1 — 2026-05-23 (polish pass)

A series of post-foundation passes over the same Memorial Day
weekend — UI breadth, accessibility, content. No breaking changes.

### Added

- **Court × month density heatmap** on the dashboard — custom SVG,
  five NOS presets (All / Patent / Securities / Antitrust / Trade
  Secret), seeded deterministic data, OKLCH-uniform color scale,
  hover tooltip.
- **Most-active leaderboard** on the dashboard — Judges / Firms /
  Corporate parties tabs with inline bar charts + 90-day trend deltas.
- **Loading skeletons** across `/dashboard`, `/search`, `/dockets/[id]`,
  `/watchlists`, `/alerts`. Pure CSS shimmer via a new `<Skeleton>`
  primitive.
- **Mobile menu** — `<Sheet>` slide-in drawer + `<MobileNav>`
  hamburger in the topbar. Desktop sidebar now hidden below `md`;
  the sheet wraps the shared `<SidebarContent>` so the nav stays
  single-source.
- **Sidebar collapsed mode** — w-60 ↔ w-14 icon-only view with
  localStorage persistence, edge-of-aside toggle button, native
  title-attr tooltips on icons.
- **AI exec-summary flow** on the docket detail — sonner loading
  toast → simulated latency → success toast + inline animated
  reveal of a three-paragraph extractive brief. Token + latency
  meta strip, copy-to-clipboard action.
- **/alerts empty state** behind `?empty=1` — editorial hero
  (animated ping bell, accent glow), three channel-option cards
  (Email / Webhook / In-app), "how alerts work" three-step strip.
- **/search hover preview** — viewport-fixed framer-motion popover
  with case header, latest AI one-line summary, plaintiff vs
  defendant split, judge, "Open case" link. 250 ms enter / 120 ms
  leave debounce, viewport-overflow flip, closes on scroll / resize / Esc.
- **Skip-to-content link** as the first focusable element on every
  page (JS finds the page's `<main>` so no per-page anchor is
  needed).
- **Two more blog posts** — "What we learned ingesting the first
  million RECAP entries" and "Open Courts Act: where it stands in
  May 2026."
- **Press kit** at `/press` — quick-facts grid, copyable boilerplate,
  4 downloadable SVG brand assets, brand-colors table, founder
  quote, screenshot tiles.

### Changed

- **Pricing comparison table** now uses semantic table markup
  (`<caption>`, `<th scope="col">`, `<th scope="row">`, `aria-hidden`
  icons + sr-only "Included" / "Not included").
- **Tabs primitive** gains full ARIA wiring — tablist / tab /
  tabpanel with id linkage and roving tabindex.
- **Sidebar + site-header** active links now carry
  `aria-current="page"`.
- **Search input** gets a visible-to-AT `<label className="sr-only">`.

### Accessibility

- `prefers-reduced-motion: reduce` is honored two ways:
  `<MotionConfig reducedMotion="user">` at root for framer-motion,
  plus a global CSS `@media` block that collapses every animation
  and transition to ~0 ms.
- New `docs/A11Y.md` documents landmarks, decisions, and the
  remaining 0.2.0 gaps (court-heatmap tabular fallback, axe-in-CI).

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
