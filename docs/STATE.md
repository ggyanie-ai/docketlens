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
- [x] Loading skeletons: `<Skeleton>` + `<SkeletonText>` primitives
      and route-level `loading.tsx` for /dashboard, /search,
      /dockets/[id], /watchlists, /alerts (CSS shimmer, no JS)
- [x] Mobile menu: `<Sheet>` primitive + `<MobileNav>` hamburger in
      topbar. Desktop sidebar hidden below `md`; sheet wraps shared
      `<SidebarContent>` so the nav is single-source. Esc + backdrop
      + route-change all close the drawer; body scroll locks.
- [x] Sidebar collapsed (icon-only) mode: w-60 ↔ w-14 transition,
      localStorage-persisted, edge-of-aside toggle button, native
      title-attr tooltips on icons, badge indicators reduced to
      colored dots, footer Upgrade card collapses to a single
      Sparkles button.
- [x] AI exec-summary toast flow on /dockets/[id]: idle → sonner
      loading toast → ~2s simulated latency → success toast + inline
      animated reveal of a three-paragraph extractive brief derived
      deterministically from the docket props (parties, NOS, judge,
      last entry). Token/latency meta strip, Copy action. Header
      "AI exec summary" button now anchor-links to #ai-exec-card.
- [x] /alerts empty state: `?empty=1` searchParam toggles a
      beautiful "no channels yet" placeholder with editorial hero
      (animated ping bell, grid mask, accent glow), three channel-
      option cards (Email / Webhook / In-app) with plan + cadence
      badges, and a three-step "how alerts work" strip. Discoverable
      from the populated state via a small "Preview empty state"
      button so marketing can screenshot it.
- [x] /search hover preview: `<CaseResultRow>` client component with
      a viewport-fixed framer-motion popover (380×~280px) showing
      court · case number, AI one-line latest filing, plaintiffs vs
      defendants split, judge, "Open case" link. 250 ms enter / 120 ms
      leave debounce, auto-flips to the left if it'd overflow the
      viewport, closes on scroll / resize / Esc.
- [x] Accessibility audit pass: SkipToContent link, aria-current on
      sidebar + site-header active nav, sr-only `<label>` on search
      input, `aria-busy` + `role="region"` on AI summary flow, full
      ARIA wiring on Tabs primitive (tablist/tab/tabpanel with id
      linkage + roving tabindex). docs/A11Y.md captures landmarks,
      decisions, and the 0.2.0 deferred-items list.
- [x] prefers-reduced-motion honored two ways: `<MotionConfig
      reducedMotion="user">` at root layout (covers every
      framer-motion component) plus a global CSS `@media` block in
      globals.css that collapses every animation/transition to
      ~0 ms — catches Tailwind `animate-ping` / `animate-spin`, our
      custom keyframes, sidebar width transition, sheet slide, etc.
- [x] Pricing comparison table semantics: `<caption className="sr-only">`,
      `<th scope="col">` headers, `<th scope="row">` for each feature
      name, sr-only "(most popular)" annotation on Pro column, and
      `aria-hidden` icons with sr-only "Included" / "Not included"
      text replacing the bare Check/X icons.
- [x] Two more blog posts: "Lessons from ingesting the first million
      RECAP entries" (engineering field notes — rate limits, dedupe,
      judge-name drift, raw-JSON cache strategy) and "Open Courts
      Act: where it stands in May 2026" (policy explainer + what
      passage would mean for DocketLens). Both wired through the
      existing typed `POSTS` array; sitemap.ts auto-includes them.
- [x] Press kit page at `/press` — quick-facts grid, copyable
      boilerplate (`<CopyButton>` client island), brand asset
      downloads (4 SVG variants in `public/press/`), brand colors
      table (OKLCH + hex), founder quote, screenshot tiles that
      deep-link to the live pages, press@docketlens.ai CTA. Added
      to sitemap + footer "Company" column.
- [x] Public `/changelog` page reading `docs/CHANGELOG.md` at build
      time. Tiny in-house `<Markdown>` renderer
      (src/lib/markdown.tsx) — block parser for h1-h3 / paragraphs /
      bullet lists / blockquotes / hr, inline parser for **bold**,
      *em*, `code`, and `[text](href)` links. Avoids pulling in
      remark/unified for the few features we need. CHANGELOG.md
      gained a 0.1.1 entry covering the eleven polish-pass wakeups.
- [x] Saved searches CRUD on /search: localStorage-persisted under
      `dl-saved-searches` (shape mirrors the `saved_searches` Drizzle
      row for an easy Tuesday cutover). `<SavedSearchesPanel>` shows
      list + per-item Load/Delete; the Save button toggles an inline
      mini-form with an auto-suggested name (e.g. "\"apple\" · S.D.N.Y.
      · Patent"). Sonner toasts on save + delete + duplicate-name guard.
- [x] Watchlist detail/edit page at `/watchlists/[id]` — header
      with color dot + entity-type badge + Pause/Delete actions;
      three-tab body (Matches / Configure / Activity) where Matches
      lists curated docket entries that hit each watchlist, Configure
      is a full edit form (basics, filters, cadence) with dirty-state
      reset + save toasts, Activity shows a recharts bar chart of
      matches/day; right-rail with Stats + Channels cards.
      generateStaticParams over SAMPLE_WATCHLISTS; unknown id ↪ 404.
- [x] API keys generate flow on /api-keys: inline new-key form with
      4-scope grid, client-side `crypto.getRandomValues` token
      generation (24-byte base64url body, `dkl_live_` prefix), and a
      one-time reveal overlay with copy-to-clipboard. User keys
      persist to localStorage under `dl-api-keys-user` (mirrors the
      `api_keys` Drizzle row); demo seed keys keep their "demo"
      badge and are not revocable client-side. Revoke removes from
      storage with confirmation toast.
- [x] /inbox: email-style two-pane in-app alert center. Left list
      grouped chronologically with unread-dot indicators, filter
      tabs (All / Unread / Read / Archived) with unread-count badge,
      bulk Mark-all-read. Right pane shows the selected message
      with AI summary callout, watchlist source, and Open-case /
      Mark-unread / Archive / View-watchlist actions. Sidebar nav
      gained an Inbox entry with badge. Sample data in
      src/lib/sample-inbox.ts mirrors `alert_deliveries` row shape.
- [x] /audit-log: admin-only event timeline over `audit_events`.
      Restricted banner with CSV-export action, 4-cell stats strip
      (Total / Last 24h / Failures / Busiest category), free-text
      filter + 7-category tab filter (Auth, Watchlist, API key,
      Alert, Billing, Data pipeline, Settings). Each row expands to
      show metadata as pretty-printed JSON, IP/UA detail, occurred-at
      timestamp. Failure rows highlighted in the danger color.
      Footer retention note (7-year + SOC2 + SIEM streaming on
      Enterprise). Sample data in src/lib/sample-audit.ts.

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
- [x] docs/A11Y.md
- [x] CONTRIBUTING.md

## What's NOT done (open queue for upcoming wakeups)

Priority order — tackle from the top. Each item is roughly 30–60 min
of work, sized to fit one wakeup.

### Polish (high impact, low risk)
- _(none currently queued — the polish queue is now empty; next:
  content + features below)_

### Content
- [ ] **Public API reference page at `/docs/api`** — render the
      existing docs/API.md through the `<Markdown>` renderer; the
      footer Resources column links there. Add a stylish code-sample
      block component.
- [ ] **`/contact` page** — simple form (name, email, body, topic
      select), Resend-stubbed submit, "we reply within 24h" copy.
      Replace the placeholder Contact link we removed from the
      footer.
- [ ] **`/email-preview` (internal dev tool)** — render the
      `renderDigestEmail()` output inline so the operator can
      review the daily digest template without sending it.
- [ ] **Comparison page `/vs/pacer`** — honest side-by-side: PACER
      vs DocketLens (cost, UX, AI, alerts, search). Companion
      `/vs/lex-machina` later.

### Features
- [ ] **Onboarding checklist on /dashboard for empty orgs** —
      shows when watchlists.length === 0: "Create your first watch
      → Pick a channel → Wait for the first alert." Dismissable.
- [ ] **Demo data toggle** on /dashboard — small switch top-right
      that lets a logged-out viewer browse with seeded data
      (already shipped on /demo but link from /dashboard too).
- [ ] **Webhook signing example** — Settings → Integrations gains
      a small "verify our HMAC" code-sample card with Node + Python
      tabs.

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
