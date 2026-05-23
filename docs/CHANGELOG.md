# Changelog

We track changes by ISO date (UTC). Stable shipping starts at 1.0.0.

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
