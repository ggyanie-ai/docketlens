# DocketLens build state

> Cursor for the autonomous May 2026 weekend build. **Read this first
> when a wakeup fires.** Read PLAN.md (this doc + ARCHITECTURE.md
> together) for the long-form plan.

## Time

- **Start:** 2026-05-23 09:11 PT (Sat morning, Memorial Day weekend)
- **Target return:** 2026-05-26 Tue 21:00 PT (~84 hours of runway)
- **Hard constraints:** code-only (no live deploys), no third-party
  service changes, never modify existing projects.

## What's done

### Foundation + UI
- [x] Scaffold (Next.js 16 + Tailwind 4 + Turbopack + TS strict)
- [x] Design system (OKLCH tokens, dark default, editorial serif)
- [x] UI primitives (button, card, badge, input, separator, kbd,
      avatar, dropdown, tabs, empty)
- [x] Theme provider, theme toggle, sonner toaster

### Marketing
- [x] Landing: hero with live docket stream, stats, logo strip,
      9-feature grid, how-it-works, 4-persona use cases, pricing
      teaser, FAQ, final CTA
- [x] /pricing — full comparison table + FAQ
- [x] /about
- [x] /demo + /demo/[id] — public sample docket tour
- [x] /blog + /blog/[slug] — 3 launch posts
- [x] /legal/privacy, /legal/terms, /legal/data-sources
- [x] /404, /error
- [x] OG image, sitemap.xml, robots.txt
- [x] /(auth) login + signup pages

### App shell
- [x] Sidebar + topbar (with cmd-k command palette)
- [x] /dashboard — KPIs, 30-day chart, watchlist summary, recent
      filings feed
- [x] /search — faceted filters, scope tabs, save search
- [x] /dockets/[id] — case header, timeline w/ AI summaries,
      parties + judges sidebar, AI exec brief CTA
- [x] /watchlists + /watchlists/new — card grid + 4-step creation
- [x] /alerts — channels + delivery history
- [x] /settings — 6-tab settings panel
- [x] /api-keys — Team-gated key management
- [x] Dashboard: court × month density heatmap (custom SVG, 5 NOS
      presets, hover tooltip, OKLCH-uniform color scale)
- [x] Dashboard: leaderboard widget (judges / firms / corporate
      parties tabs with inline bar charts + 90-day trend deltas)

### Engine
- [x] CourtListener REST v4 client (typed, rate-limited)
- [x] AI summarization service (Claude, versioned prompts, three
      tiers, prompt-cached system block)
- [x] Drizzle schema (21 tables) + libSQL local + Postgres-ready
- [x] Watchlist matcher (deterministic, explainable)
- [x] Alert engine (materialize matches, build digests)
- [x] Email digest renderer (plain + minimal HTML)
- [x] Dispatcher (Resend + webhook + in-app)
- [x] Ingestion worker (scripts/ingest.ts) with idempotent persistence
- [x] Seed script (scripts/seed.ts)
- [x] REST API v1 — discovery, dockets, search, watchlists, bearer auth

### CI/CD + docs
- [x] .github/workflows/ci.yml — typecheck + build on push
- [x] .github/workflows/ingest.yml — hourly cron
- [x] docs/ARCHITECTURE.md
- [x] docs/DEPLOY.md
- [x] docs/MONETIZATION.md
- [x] docs/API.md
- [x] docs/RUNBOOK.md
- [x] docs/CHANGELOG.md
- [x] CONTRIBUTING.md

## What's NOT done (open queue for upcoming wakeups)

Priority order — tackle from the top. Each item is roughly 30–60 min
of work, sized to fit one wakeup.

### Polish (high impact, low risk)
- [ ] **Loading skeletons** on dashboard, search, docket detail
      (currently popped-in).
- [ ] **Mobile menu** — sidebar collapses on `md` breakpoint; add a
      hamburger + sheet on the topbar for app routes.
- [ ] **Sidebar collapsed mode** (icon-only) with localStorage state.
- [ ] **Toast for "AI summary generated"** wire to a fake action so
      we can show the flow.
- [ ] **Empty-state for /alerts when channels=0** (currently always
      has data).
- [ ] **Hover preview on case cards in /search** — popover with first
      AI summary + parties.
- [ ] **Accessibility audit pass** — `axe` on the 8 highest-traffic
      routes; fix contrast, labels, landmarks.

### Content
- [ ] **2 more blog posts** — "What we learned ingesting the first
      million RECAP entries" and "Open Courts Act: where it stands in
      May 2026."
- [ ] **Press kit page** — `/press` with logos (svg), product
      screenshots, founder quote, contact.
- [ ] **Changelog page** — `/changelog` reading from
      `docs/CHANGELOG.md` via MDX.

### Features
- [ ] **Saved searches CRUD** — wire the "Save" button on /search to
      a real flow. Schema already has `saved_searches`.
- [ ] **Watchlist edit page** — `/watchlists/[id]` (currently only
      `/watchlists/new`).
- [ ] **Settings → API keys generate flow** with one-time reveal.
- [ ] **/inbox** — in-app alert inbox reading `alert_deliveries`
      where channel='in_app'.
- [ ] **/audit-log** — admin-only view over `audit_events`.

### Auth (Tuesday wire-up — don't break the stub)
- [ ] Install Better-Auth, write the adapter, wire magic-link flow,
      Google OAuth gated on env. Schema is already ready.

### Tests (deferred until 0.2.0)
- [ ] vitest setup, snapshot tests for the matcher, a Playwright
      smoke for the marketing pages.

## Open invariants — do not violate

1. **Code-only, no live deploys.** Don't run `vercel --prod`, don't
   purchase domains, don't add billable services.
2. **Don't touch other projects.** Anything outside
   `~/projects/docketlens/` is off-limits except the memory dir and
   the `_weekend_build/STATE.md` if updates make sense.
3. **AI is extractive only.** Never add a "predict outcome" feature.
4. **Typecheck must stay green** at the end of each wakeup.
5. **Commit + push at the end of each wakeup** so progress is durable.

## Operating cadence per wakeup

1. Read this file + git log to see last work.
2. Pick top open queue item.
3. Implement, typecheck (`pnpm typecheck`), spot-check via curl on
   the dev server (port 3000).
4. Commit + push.
5. Update this file: move done items to "What's done", add new ones
   to the queue if discovered.
6. Exit.

## Resources

- GitHub: <https://github.com/donnowyu/docketlens> (private)
- Dev server (background): <http://localhost:3000>
- Sample data: `pnpm db:seed` repopulates 6 dockets + 4 watchlists.
- Anthropic key: `~/projects/superbot/.env` has `ANTHROPIC_API_KEY` if
  needed for live testing (don't expose in commits).
