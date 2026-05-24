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
- [x] Public docs site: `/docs` index + dynamic `/docs/[slug]`
      reading whitelisted markdown files (`API.md`, `ARCHITECTURE.md`,
      `A11Y.md`) through the in-house `<Markdown>` renderer.
      `src/content/public-docs.ts` is the allowlist (internal docs
      DEPLOY/RUNBOOK/STATE/MONETIZATION stay in the repo only). Index
      grouped by Reference / Engineering / Operating with read-time
      badges and "Keep reading" cross-links on each doc page. Wired
      into sitemap + footer Resources (Documentation + API reference
      links). generateStaticParams over the allowlist; unknown slugs
      ↪ 404 (verified with curl returning a real 404).
- [x] `/contact` page: two-pane editorial layout — left form (name,
      email, 7-topic Select primitive, body) with stubbed
      Resend-shaped submit, post-submit success state, security-
      topic warning callout (use security@docketlens.ai + PGP).
      Right rail has email-direct card, four "fast lane" cards
      (Docs / Press / Pricing / Bug), office-hours card. New
      `<Select>` UI primitive matches Input styling. Wired into
      sitemap + footer Company column (restored Contact link).
- [x] `/email-preview` internal dev tool: server-rendered side-by-
      side preview of `renderDigestEmail()` against synthetic match
      items. `?cadence=instant|hourly|daily` URL param drives the
      variant (1 / 3 / all sample dockets). Subject + plaintext
      (mono code block) + HTML (600px sandboxed iframe). `noindex`
      metadata so it never lands in search. Sample → schema row
      adapters built so future DB swap-in is mechanical.
- [x] `/vs/pacer` comparison page: editorial hero, 3-cell pricing
      gist (PACER per-page · DocketLens Pro · break-even at 490
      pages/mo), 14-row feature-by-feature table with per-row
      trade-off notes + proper `<th scope>` semantics, "Where
      PACER actually wins" 3-card section (we're honest about
      sealed cases, specialty courts, authoritative source),
      5-card "Where DocketLens wins", worked example computing
      monthly cost for a 5-case solo attorney ($73 vs $49),
      closing CTA. Added to sitemap.
- [x] `/vs/lex-machina` comparison page: same template, respectful
      positioning ("not a replacement — the affordable option for
      the 95% who can't justify $25k/yr"). 3-cell pricing gist
      ($25k/yr LM vs $199/mo Team vs $245k/yr savings at 10
      attorneys), 15-row feature table that honestly cedes
      predictive analytics + expert witness directory + enterprise
      contracts. 3-card "Where Lex Machina actually wins" with
      explicit "talk to them" copy, 5-card "Where DocketLens wins"
      led by self-serve pricing and 10× lower TCO. Worked
      example: 10-attorney boutique → $250k vs $4k. Trademark
      disclaimer in the footer.
- [x] Dashboard onboarding checklist: `<OnboardingChecklist>` client
      component with two variants — `hero` (full-card empty-state)
      and `inline` (compact, dismissible strip above the KPIs).
      4 steps (watchlist · channel · API key · tour) with
      individual checkboxes + progress bar; localStorage state
      under `dl-onboarding-steps` + `dl-onboarding-dismissed`,
      "reopen" affordance after dismissal. /dashboard accepts
      `?empty=1` to render only the hero variant for first-run +
      marketing screenshots.
- [x] Dashboard demo-data tag: `<DashboardDemoTag>` — small pill in
      the dashboard's top-left ("Demo data · local" with Beaker
      icon + chevron) that opens a dropdown with three actions:
      Empty-org preview (→ ?empty=1), Public guest tour (→ /demo),
      and Reset onboarding checklist (clears localStorage flags +
      router.refresh). Right side carries a one-line explainer
      that this is sample data until Tuesday's DB wire-up.
- [x] Webhook signing example: `<WebhookSigningCard>` under
      Settings → Integrations. Documents the
      X-DocketLens-Signature header (HMAC-SHA256 hex, sha256=
      prefix), shows a sample request-headers block, and ships
      copy-to-clipboard code samples in Node.js / Python / Go tabs.
      Three explainer notes (constant-time compare · ack fast ·
      replay protection via X-DocketLens-Delivery) plus a deep
      link to /docs/api. Active sample's copy button switches to
      success state on click.
- [x] `/status` public status dashboard: overall-status hero (color
      adapts to worst-service status), 6-service grid (Web app /
      REST API / Ingest worker / AI summarization / Email delivery
      / Database) with per-service detail + 90-day uptime, 4-cell
      pipeline-metrics grid (ingest last-run · CL daily quota · AI
      cache hit · email failure rate), incidents list with severity
      badges (empty-state when zero), transparency footer linking
      to docs/ARCHITECTURE.md for the metric-source map. Synthetic
      green-state data today; layout stays once real signals wire
      Tuesday. Added to sitemap.

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
- [ ] **`/jurisdictions` page** — beautiful index of every covered
      federal court (94 districts + 13 circuits + bankruptcy +
      Supreme Court) grouped by region, with per-court deep-links
      into `/search?court=…`. SEO + completeness signal.
- [ ] **`/comparison` index** — landing for the /vs/* pages with a
      framing paragraph and links to vs/pacer + vs/lex-machina.
- [ ] **`/.well-known/security.txt`** route + a small
      `/security` page describing PGP key, scope, response time,
      and Hall of Fame placeholder.

### Features
- [ ] **CSV export on /search results** — small "Export 12
      results · CSV" button that runs client-side csv-stringify
      on the currently-filtered SAMPLE_DOCKETS slice.
- [ ] **`/shortcuts` page** — comprehensive keyboard reference
      table. Already promised in the command-palette tip + the
      account menu's "Keyboard shortcuts" item.

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
