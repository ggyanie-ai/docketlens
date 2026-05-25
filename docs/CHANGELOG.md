# Changelog

We track changes by ISO date (UTC). Stable shipping starts at 1.0.0.

## 0.1.4 — 2026-05-25 (CRUD completion + observability)

The continuous-loop pass continued — 20 commits between 0.1.3 and
0.1.4. Focus: filling out the REST API into a complete CRUD
surface, observability headers + telemetry, three more blog posts,
two more glossary terms, and a watchlist `priority` field. No
breaking changes.

### Added — API

- **`/api/v1/watchlists/{id}` PATCH + DELETE** — completes the
  REST CRUD quad. Sparse Zod-validated PATCH; idempotent
  soft-delete via `deleted_at`.
- **`/api/v1/saved-searches` + `/{id}` CRUD** — list, create,
  get, sparse PATCH, idempotent DELETE. Pro+ on writes. Same id
  space as the existing feed siblings.
- **`/api/v1/health` 301 alias** to `/api/health` for monitors
  that assume the version prefix.
- **`/api/v1/me` + `/api/v1/usage`** — caller identity + plan +
  per-plan ceiling, with usage shape forward-compatible for the
  Tuesday token-bucket meter.
- **`/api/v1/courts`** — every CourtListener-mirrored court we
  cache, filterable by `?in_use=` and `?jurisdiction=`.
- **`/api/v1/dockets` query expansion** — list endpoint now
  filters by `?nos=` (NOS-code prefix), `?date_from=`, `?date_to=`.
- **`/api/v1/dockets/{id}` ETag + 304** — strong ETag derived
  from `(id + max-mtime + count)`; conditional GET via
  `If-None-Match`.
- **`/api/v1/dockets/{id}/parties` + `/entries`** — narrow
  siblings of the combined endpoint for clients that only need
  one shape. Entries supports `?since=` and `?limit=`.
- **`/api/v1/dockets/{id}/ai-summaries/refresh`** — Pro+ POST
  that queues an on-demand summarization. 202 with opaque
  `job_id`; 60s per-docket cooldown returns 429 with
  `retry_after_seconds`.
- **`/api/v1/dockets/{id}/notes` GET/PUT/DELETE** — per-org
  private Markdown annotations on a docket. Replace-on-write,
  20KB cap, idempotent delete. Notes are never shared across
  orgs.
- **`/api/v1/digest/preview`** — REST twin of `/inbox/digest-preview`.
  Returns the next outgoing digest with `?cadence=` +
  `?format=json|html|text`. Plan-gated cadence (Free = daily
  only).
- **`/api/v1/log-404`** — privacy-preserving 404 telemetry the
  /404 page POSTs to. Aggregate counts only; DNT-respecting.
- **OpenAPI 3.1 spec catch-up** — 23 paths, 24 schemas. Spec
  now covers every shipped endpoint.

### Added — response headers

- **`x-request-id`** on every `/api/v1/*` response (uuid-shaped
  `req_…`). CORS-exposed alongside `etag`, `x-ratelimit-*`, and
  `x-docketlens-cl-pool-remaining`.
- **`x-ratelimit-{limit,remaining,reset}`** on `/api/v1/dockets`
  list responses.
- **`x-docketlens-cl-pool-remaining`** on `/api/v1/dockets/{id}`
  responses so ingest-aware clients can back off when the pool
  is saturated.
- **`X-Robots-Tag: noindex, nofollow`** on `/widget/:path*` via
  `next.config.ts` — third-layer defense alongside `metadata.
  robots` + `robots.txt`.

### Added — surfaces

- **`/p/{id}` short-URL redirect** — `wl_` → /watchlists/preview,
  `dkt_` → /demo. Cleaner pastes for tweets and SMS.
- **`/watchlists/{id}/preview` Copy URL button** — navigator.share-
  aware `CopyLinkButton`.
- **`/404` "Did you mean?"** — Damerau-Levenshtein fuzzy-match
  against a curated public-route pool.
- **`/audit-log` URL-driven filters** — `?q=&category=&range=`
  with 250ms debounce; shareable + back-button-navigable.
- **`/audit-log` date-range chips + CSV export** wired to
  `csv.ts`. Range chips: Last 24h / 7d / 30d / All time.
- **`/audit-log` loading skeleton** that mimics the timeline
  shape — admin banner, KPI strip, filter bar, 6-row rows.
- **`/inbox?empty=1`** empty-state with motion-safe pulse and a
  CTA into the watchlist templates flow.
- **`/inbox` Gmail-style keyboard nav** — `e` archives + auto-
  advances; `j/k` (and ↓/↑) walk the filtered list.
- **`/dockets/{id}` vim-style timeline keynav** — `j/k/g/G/↓/↑`
  + `/` focuses search; one-time sonner hint. Discoverable kbd
  chip ("j k to navigate") in the timeline header.
- **`/widget/{id}?theme=light|dark|auto`** explicit theme override.
- **`/widget/{id}?hide=footer`** strips the attribution footer
  (gating mechanism in place; plan-check lands Tuesday).
- **`/widget` snippet collapse** — embed code now lives behind
  a `<details>` summary; the live iframe is the primary
  affordance.
- **`/search` `⌘E`/`Ctrl+E` + `↑`/`↓` row navigation + Enter to
  open**. Discoverable chip on the Export button.
- **`/search` filter persistence** in localStorage with 300ms
  debounce; URL params still win.
- **`/dashboard?focus=embeds`** deep-link scroll via inline RAF-
  scheduled `scrollIntoView`.
- **`/settings` → Security audit preview** card with the last
  10 events linking to `/audit-log`.
- **`/inbox/digest-preview`** page renders the live digest HTML
  in a sandboxed iframe (no JS, no images).
- **`/api/og?theme=light|dark`** theme-able Open Graph generator
  for light-mode embedders.
- **WatchlistEditForm priority slider** (PRO) — 0-100 with Low /
  Normal / High labeled stops.
- **Watchlist starter templates surface** (`?empty=1`) now
  reachable one click earlier via the OnboardingChecklist.
- **`/tools/verify-webhook` HowTo JSON-LD** for tutorial rich
  cards.

### Added — content

- 5 new blog posts (#9–#13): OpenAPI 3.1 comparison,
  state-court coverage gaps, "what counts as a watchlist,"
  NOS field guide, and the `/status` metrics retrospective.
- 5 new glossary terms: JPML, MDL transferee judge, §1782
  discovery, in camera review, PSLRA pleading standard,
  scheduling conference, Brady material (7 total since 0.1.3).
- Engineering-tagged blog posts continue to surface the
  API-reference CTA card.

### Schema

- **`watchlists.priority`** — Pro+ ranking field (0-100, default
  50). Composite index `(org_id, priority)` for hot per-org
  sorted listings.
- **`docketNotes`** — new table for per-org private Markdown
  annotations on a docket. Unique index `(org_id, docket_id)`.
- **`docket_notes`**, **`not_found_pings`**, and
  **`ai_summary_refresh_queue`** all lazy-create via
  `CREATE TABLE IF NOT EXISTS` at the call site so the
  in-code Drizzle schema and the live DB stay loosely coupled
  until Tuesday's `drizzle-kit generate` pass.

### Changed

- **`matcher.ts` tier-3** unreachable dead code removed (proven
  by the 134-test vitest suite on the parallel branch).
- **Command palette** — 9 new destinations across Navigation +
  "Tools + docs" group: Inbox, Audit log, API reference, widget,
  verify-webhook, feeds, glossary, pricing, etc.
- **Footer wordmark** is now a link with an accent-underline-
  grow hover; Resources column gains "Feeds" + retargets API
  reference to the interactive renderer.

### Parallel branches (NOT merged on main — user supervises)

- **`worktree-agent-a15024f436e5cce40`** — vitest infra + 134
  passing tests, CI integration, `docs/TESTING.md`.
- **`worktree-agent-afbd4f9582cd409c9`** — /comparison refresh
  + ARCHITECTURE/API/RUNBOOK doc refreshes.

## 0.1.3 — 2026-05-25 (operations + shareability)

The continuous-loop pass. Smaller than 0.1.2 in surface area,
deeper in operational + observability work. No breaking changes.

### Added — API

- **`/api/v1/me`** — caller identity. Returns the calling key's
  id, prefix, scopes, last-used timestamp; the org's id, name,
  slug, plan; and per-plan rate-limit ceilings.
- **`/api/v1/usage`** — call-volume vs. ceiling. Forward-compatible
  shape: `used.{per_minute,per_hour,per_day}` is null today and
  goes int when the token-bucket meter ships, no client rework.
- **`/api/v1/courts`** — every CourtListener-mirrored court we
  cache, with `?in_use=` and `?jurisdiction=` filters.
- **`/api/v1/dockets/{id}/parties`** and **`/entries`** — narrow
  siblings of the combined endpoint for consumers that only
  need one shape. `/entries` supports `?since=` and `?limit=`.
- **`/api/health` now reports CourtListener pool** — `checks.cl_pool`
  carries the pool's limits + remaining counts. Informational
  (saturation slows ingest, not the web app, so `ok` stays
  gated on `db`).
- **`/api/og?theme=light|dark`** — theme-able Open Graph image
  variant for embedders whose host page is light-mode.

### Added — surfaces

- **`/p/{id}`** short-URL redirect (`wl_` → preview, `dkt_` →
  demo). Cleaner pastes for tweets / Slack / SMS.
- **`/watchlists/{id}/preview`** public read-only share page.
  No-auth, OpenGraph unfurl, latest 5 matches with one-line
  summaries. Per-page noindex. Linked from the watchlist
  detail view via a "Public preview" button and from the
  page itself via a navigator.share-aware `<CopyLinkButton>`.
- **`/404` "Did you mean?" fuzzy-match block** —
  Damerau-Levenshtein over a curated public-route pool.
- **`/audit-log` URL-driven filters** — q, category, range now
  live in `?q=&category=&range=`. Shareable + back-button
  navigable, 250ms debounced. Date-range chips (Last 24h / 7d /
  30d / All time). CSV export wired to `src/lib/csv.ts`.
- **Webhook deliveries table on `/alerts`** — last 30 days with
  HTTP code, latency, attempts, retry button, and "Send a
  test webhook" + "Verify a signature" actions.
- **`/inbox?empty=1`** empty-org preview with motion-safe pulse
  and "Send your first alert" CTA into the watchlist templates.
- **Watchlist starter templates on `/watchlists?empty=1`** —
  six prebuilt suggestions deep-linking to `/watchlists/new`
  with the form pre-filled. OnboardingChecklist routes
  through this surface so users see templates one click earlier.
- **Pricing FAQs** — eight pricing-specific FAQs above the
  global product FAQ, with `FAQPage` JSON-LD for SERP rich
  results.
- **Settings → Security audit preview** — last 10 audit events
  inline with a link to the full timeline.
- **`/feeds.opml`** OPML 2.0 bundle so OPML-aware readers can
  import the blog + changelog feeds in one click.
- **`/feeds` hub** — single human-readable index of every public
  feed.
- **Atom + JSON Feed siblings** for `/blog/feed.xml`,
  `/changelog/feed.xml`, and `/api/v1/saved-searches/{id}/feed.xml`,
  with content negotiation on the canonical `.xml` route.
- **Site-wide feed auto-discovery** — `<link rel="alternate">`
  tags for all three formats × blog + changelog emitted from
  root `<head>` (not metadata) so per-page `alternates` don't
  clobber them.
- **`/widget/{id}?theme=light|dark|auto`** — explicit theme
  override on embedded case widgets.
- **`/tools/verify-webhook`** — client-side HMAC signature
  playground. Web Crypto only; secret never leaves the page.
  HowTo JSON-LD makes the page eligible for tutorial rich
  cards.

### Added — UI

- **Dashboard "your embeds" card** — top 5 dockets by widget
  impressions + 30-day grand total.
- **Saved-search match count badge** + RSS/Atom/JSON format
  picker on the /search saved-searches panel.
- **`/search` `⌘E` / Ctrl+E** keyboard shortcut for CSV export
  with a discoverable chip in the Export button.
- **`/audit-log` date-range chips** (Last 24h / 7d / 30d /
  All time).
- **Footer wordmark link to `/`** with an accent-underline-grow
  hover, plus a new "Feeds" entry in the Resources column and
  the "API reference" link retargeted to the interactive
  renderer at `/docs/api-reference`.
- **`/search` input `⌘K` chip** for command-palette discovery.

### Added — schema.org structured data

A coordinated entity graph across the marketing surface, paired
with the new `/docs/structured-data.md` inventory:

- `/` ships **`SoftwareApplication`** + **`WebSite`** +
  **`SearchAction`** (sitelinks search box).
- `/about` ships **`Organization`** (logo, foundingDate,
  contactPoint, sameAs).
- `/pricing` ships **`FAQPage`** with 8 Q/A pairs.
- `/blog/[slug]` picks **`TechArticle`** (Engineering tag) or
  **`NewsArticle`** otherwise.
- `/legal/data-sources` ships **`Dataset`** with proper
  lineage (creator: Free Law Project, publisher: DocketLens,
  license: CC0).
- `/tools/verify-webhook` ships **`HowTo`** with 3 steps.
- `/blog/[slug]`, `/docs/[slug]`, `/demo/[id]`,
  `/legal/data-sources`, `/about`, `/tools/verify-webhook` all
  ship `BreadcrumbList`.

### Added — content + a11y

- Five new glossary terms: scheduling order, Daubert motion,
  JPML, MDL transferee judge, Section 1782 discovery.
- Two new blog posts: "What we learned the first time we
  tried to summarize a 400-page Markman ruling" (Engineering)
  and "We built on Free Law Project. So we donate back."
  (Industry).
- Engineering-tagged blog posts now end with an API-reference
  CTA card.
- Live `/status` health-poll dot polling `/api/health` every
  60s, motion-safe.
- Markdown headings now emit `id="kebab-slug"` plus a SemVer
  alias `<a id="X.Y.Z">` so the changelog feed's `#0.1.3`
  permalinks scroll correctly.

### Changed

- **matcher.ts**: the tier-3 substring fallback was unreachable
  dead code — proven by the 134-test vitest suite shipped on a
  sibling branch — and is deleted. Behaviour unchanged.
- **Sitemap**: per-route priorities + changeFrequency tuned
  (1.0 home → 0.3 legal/auth, hourly for feeds, yearly for
  legal/login). 1 entry at 1.0, 2 at 0.9, sensible bell across
  the rest.
- **robots.txt**: expanded disallow (per-docket widget pages,
  inbox, audit-log, email-preview, `.well-known/`).
- **hreflang**: `x-default` + `en` `<link>` tags on root.
- **Root `<head>`**: inline `<link rel="alternate">` tags for
  all 6 marketing feeds; survives per-page `alternates`
  overrides.

### Parallel branches (NOT merged on main — user supervises)

- **`worktree-agent-a15024f436e5cce40`** — vitest infra + 134
  tests across `filter` (41), `matcher` (45), `structured-data`
  (29), `widget-pings` (19). CI extended with `pnpm test`.
  `docs/TESTING.md` added.
- **`worktree-agent-afbd4f9582cd409c9`** — /comparison page
  refresh (3 new competitors + at-a-glance matrix) and
  ARCHITECTURE.md / API.md / RUNBOOK.md refreshes.

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
