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
- [x] `/jurisdictions` court directory: typed dataset of every
      federal court (`src/content/jurisdictions.ts`) — 13 Circuit
      Courts of Appeals, 94 District Courts grouped by region
      (Northeast / Mid-Atlantic / South / Midwest / West / Federal
      seat / Specialty), SCOTUS + 5 specialty courts (USCIT, Tax,
      Veterans, Fed. Cl., C.A.A.F.). Every entry deep-links to
      `/search?court=<CL-slug>`. `/search` now reads `?court=` and
      `?q=` on mount and pre-fills filters — wired via a small
      SLUG_TO_SHORT mapping for the courts present in the chip row.
      Page also has a 5-cell totals strip + a "what we don't cover"
      footer pointing to /legal/data-sources.
- [x] `/comparison` index: editorial hero + 2 large shipped-
      comparison cards (PACER, Lex Machina) each with category
      badge, positioning paragraph, pricing-wedge mini-card, deep
      link into /vs/[slug]. "Coming next" 4-tile grid (Bloomberg
      Law / Docket Navigator / CourtListener / Westlaw Edge) with
      Q3-Q4 ETA badges. "Our comparison house style" note that
      codifies the lead-with-what-the-competitor-does-better policy.
      Footer Resources column gains a Comparisons link; sitemap
      includes /comparison.
- [x] Security disclosure: `/.well-known/security.txt` route
      handler emits a proper RFC 9116 document (Contact, Expires
      auto-rolled to +1 year, Encryption, Acknowledgments,
      Preferred-Languages, Canonical, Policy, Hiring) with
      text/plain content-type. Human-readable `/security` page
      mirrors it: contact card (email + PGP + 24h response), what
      to include, in/out-of-scope side-by-side, safe-harbor block,
      Hall of Fame placeholder, "no paid bounties yet" note.
      Sitemap includes /security.
- [x] CSV export on /search results: tiny `src/lib/csv.ts` writer
      (Excel-compatible escaping, UTF-8 BOM) + `downloadCsv()`
      blob/anchor helper. /search now has an "Export CSV" button
      next to the results count that emits a 16-column CSV
      (court, case_number, case_name, NOS, cause, jury_demand,
      status, judge, dates, plaintiffs/defendants arrays joined,
      tags, latest AI one-liner, deep URL) of the currently-
      filtered docket set. Disabled when zero matches; sonner toast
      on success. Filename includes an ISO timestamp.
- [x] `/shortcuts` keyboard reference: 7 grouped sections
      (Global · Navigation · Search · Docket detail · Watchlists ·
      Inbox · Alerts) with ~30 shortcuts total. `<KeyCombo>` helper
      renders chord sequences with arrow separators (G → D), simple
      combos with + separators (⌘ + K). "planned" badge for the
      shortcuts that aren't wired yet so this page reads as a spec
      we're building against. Account-menu dropdown items in the
      topbar are now actually wired (Account settings → /settings,
      API keys → /api-keys, Documentation → /docs, Keyboard
      shortcuts → /shortcuts, Sign out → /login). Sitemap includes
      /shortcuts.
- [x] Persona landings at `/use/[slug]`: dynamic route with
      generateStaticParams over `src/content/personas.ts`.
      Three shipped slugs — `journalists` (newsroom alerts before
      the press release), `investors` (litigation-as-signal,
      Slack/REST API/Team-tier pitch), `lawyers` (Bloomberg Law on
      a solo's budget). Each page: hero with eyebrow + accent-
      italic title, 3-feature grid, "worked example" with
      before/after side-by-side + monthly cost + pull quote,
      cross-link to the other two personas, closing CTA. Sitemap
      includes all three.
- [x] `/donate` page: editorial citizenship surface acknowledging
      the Free Law Project. Hero + dual CTA (donate.free.law +
      free.law). 3-card suggested-amounts strip ($5 / $15 / $50,
      matched to free / Pro / Team tiers). "What DocketLens does"
      side-by-side: Today (attribution everywhere) vs As-we-scale
      (5%-of-MRR donation commit once we hit $10k MRR + upstream
      PRs). 3 free-options cards (install RECAP extension,
      contribute on GitHub, evangelize). "Why this page exists" pull
      paragraph + closing CTA with not-affiliated disclaimer.
      Sitemap includes /donate.
- [x] RSS 2.0 feeds: `src/lib/rss.ts` — hand-written RSS emitter
      (no remark/feed dep), XML-escape + CDATA-wrap, atom:self
      link, dc:creator + content:encoded namespaces. Two feeds:
      `/blog/feed.xml` (iterates the typed POSTS array, category =
      post tag) and `/changelog/feed.xml` (parses
      docs/CHANGELOG.md heading-by-heading via a small regex,
      emits one item per version with the body wrapped in a `<pre>`
      content:encoded block). Both pages now carry
      `metadata.alternates.types["application/rss+xml"]` so
      browsers / readers auto-discover.
- [x] `/lookup` quick docket-number redirect: editorial hero with
      one big monospace input. On submit: lenient regex check, then
      exact-match the cached SAMPLE_DOCKETS by case number → push
      to `/dockets/[id]`; otherwise push to `/search?q=<num>` with
      a "not in cache" toast. `?q=<num>` URL param auto-resolves on
      mount so the page works as a browser keyword-search target
      (`dl 1:25-cv-04812` → /lookup?q=… → /dockets/[id]). Try-one
      chips for the 5 sample case numbers, "what gets accepted"
      reference card (district + civil / MDL / appeals / free text
      fallback), Chrome/Firefox setup links for the address-bar
      shortcut. Sitemap includes /lookup.
- [x] `/glossary` legal-terminology page: 30 typed entries
      (`src/content/glossary.ts`) across 6 categories — Data
      sources, Case lifecycle, Pleadings & motions, Procedural,
      Parties & roles, DocketLens-specific. Each entry has an
      anchored id so we can deep-link (e.g. /glossary#12b6),
      optional short/acronym form, plain-English body, and a
      Related-terms strip linking back into the glossary. Page
      has a category jump-nav up top and a "term missing?"
      contact CTA. Sitemap includes /glossary.
- [x] Fourth blog post: "We don't predict outcomes — and here's
      the architecture that enforces it" (Engineering, 9 min).
      Engineering deep-dive on the six concrete constraints that
      keep our extractive-only promise honest: system-prompt
      contract; PROMPT_VERSION pinning + cache invalidation; tier
      gating as enforcement not just UX; web app never talks to
      the model directly (ingest worker only); what the model
      never sees (no prior cases / no judge history / no
      commenter context); three-layer test stack (linter-style
      banned-token spot checks, round-trip diff for model drift,
      source-tracing audits). Auto-included in sitemap + /blog/feed.xml.
- [x] `/api/health` liveness ping: GET returns JSON `{ ok, status,
      service, version, prompt_version, ts, uptime_seconds, git_sha,
      checks: { db: { ok, latency_ms } } }` with 200 healthy / 503
      degraded. HEAD honored for monitors that prefer it. Single
      DB round-trip (`select 1`) with a hard 2-second timeout; no
      CL / Anthropic / Resend calls (those are ingest-worker
      concerns and shouldn't 5xx the web app probe). cache-control
      no-store. No auth — it's a public probe.

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
- [x] HowTo JSON-LD on /tools/verify-webhook. New
      `<HowToJsonLd>` helper accepts `name`, `description`,
      `pageUrl`, `totalTimeISO` (ISO 8601 duration), and a
      `steps[]` of `{ name, text, url? }`. Each step's url is
      joined to pageUrl if it starts with `#` so anchor links
      stay correct after canonicalisation. Wired on
      /tools/verify-webhook with three steps that mirror the form
      labels exactly (paste secret → #vw-secret, paste body →
      #vw-payload, paste signature → #vw-sig), totalTime PT45S.
      Page now also ships a Breadcrumb (Home → Tools → Verify
      webhook signature). Verified payload, three positioned
      HowToStep entries, and absolute step URLs.
- [x] Dataset JSON-LD on /legal/data-sources. New
      `<DatasetJsonLd />` helper. Payload deliberately models
      lineage correctly: `creator: Free Law Project` (the
      RECAP/CourtListener originator) + `publisher: DocketLens`
      (we re-publish + augment). License = CC0 (matches public-
      records status). Includes 8 keywords aimed at Google
      Dataset Search ("federal court dockets", "PACER
      alternative", etc.), spatialCoverage (United States),
      temporalCoverage `1996-01-01/..` (PACER launch), and a
      `distribution[]` with two DataDownload entries (our REST
      API + the saved-search RSS template). sameAs[] points to
      CourtListener + free.law/recap. Mounted on
      /legal/data-sources alongside a Breadcrumb. Verified
      payload + both scripts ship on the page.
- [x] WebSite + SearchAction JSON-LD on /. New
      `<WebSiteJsonLd />` helper in
      `src/lib/structured-data.tsx` emits `@type: WebSite` with a
      stable `@id` (`${SITE}/#website`) and a `potentialAction:
      SearchAction` whose `urlTemplate` is
      `${SITE}/search?q={search_term_string}` plus the required
      `query-input: "required name=search_term_string"`
      assertion. Makes the site eligible for Google's sitelinks
      search box treatment (small search input under the SERP
      entry). Mounted alongside the existing SoftwareApplication
      payload on /. Verified both scripts emit on /.
- [x] NewsArticle / TechArticle JSON-LD on /blog/[slug]. New
      `<ArticleJsonLd meta={…} />` island in
      `src/lib/structured-data.tsx` picks the subtype from the
      post's `tag`: anything matching /engineer/i (case-insensitive)
      emits `TechArticle`, everything else emits `NewsArticle`.
      Payload includes headline, description, url (absolute via
      mainEntityOfPage), datePublished (normalised to RFC 3339 if
      the source is YYYY-MM-DD only), dateModified, author
      (Organization), publisher (Organization + logo as ImageObject),
      articleSection (the post tag), image (defaults to
      /opengraph-image), inLanguage en-US, isAccessibleForFree true.
      Wired on /blog/[slug] right alongside the existing
      BreadcrumbJsonLd. Verified end-to-end: extractive-architecture
      post → TechArticle/Engineering; PACER post → NewsArticle/Industry.
- [x] Organization JSON-LD on /about. Companion to the
      SoftwareApplication entity on / (Google resolves them via
      the shared `publisher` field). New helper
      `OrganizationJsonLd` in `src/lib/structured-data.tsx`
      emits: `@type: Organization`, name, logo (`/icon.png`),
      url, description, foundingDate (2026), email,
      `contactPoint[]` (customer support), and `sameAs[]`
      (GitHub + X). Mounted at the top of /about alongside a
      BreadcrumbJsonLd (Home → About) so the page contributes
      both entities. Verified both payloads emit on /about.
- [x] BreadcrumbList JSON-LD on deep pages. New shared helper
      `src/lib/structured-data.tsx` exposes
      `<BreadcrumbJsonLd items={[…]} />` that emits a clean
      schema.org BreadcrumbList from a relative or absolute URL
      list (relative paths get joined to NEXT_PUBLIC_APP_URL).
      Wired into three routes:
        /blog/[slug]   →  Home → Blog → <post title>
        /docs/[slug]   →  Home → Documentation → <doc title>
        /demo/[id]     →  Home → Demo cases → <case short name>
      All three verified end-to-end (positions 1–3, full
      absolute URLs, doc-typed strings render correctly).
      Single source of truth for the breadcrumb helper —
      future deep routes drop in one component, no JSON
      boilerplate.
- [x] SoftwareApplication JSON-LD on the marketing root (/).
      Companion to the FAQPage block on /pricing. Payload:
      `@type: SoftwareApplication`, `BusinessApplication` /
      `Legal Research`, three `Offer` blocks (Free $0, Pro $29,
      Team $149, each with priceSpecification + InStock
      availability), six `featureList` entries (extractive AI,
      watchlist coverage, alert channels, REST API + OpenAPI,
      widget + oEmbed, RSS/Atom/JSON Feed), and `sameAs`
      cross-links to the GitHub repo + X account. Skipping
      `aggregateRating` until we have real public reviews —
      Google de-ranks fabricated rating counts. Comment block at
      the top notes the price coupling to the pricing-preview
      component so future price changes get updated in both
      places.
- [x] Pricing FAQs ship schema.org FAQPage JSON-LD for SERP rich
      results. Added a `plain` (HTML-free) twin field per FAQ on
      /pricing alongside the existing JSX answer; injected
      `<script type="application/ld+json">` with `@type: FAQPage`
      and 8 `Question` entries (`acceptedAnswer.text` = plain
      version). Plain text deliberately written for readability
      in SERPs — search engines accept HTML but a clean prose
      snippet is what ranks. Verified payload: @type FAQPage,
      8 questions, full answers serialize.
- [x] OnboardingChecklist "Create your first watchlist" step now
      routes through `/watchlists?empty=1` (instead of jumping
      straight to /watchlists/new), surfacing the six prebuilt
      template cards one click earlier. CTA text updated to "Pick
      a watchlist" and body copy now hints at the templates so
      users know what's coming. Pure data tweak; comment notes
      the routing rationale for future maintainers.
- [x] Pricing-specific FAQ inline on /pricing — eight pre-empts
      between the comparison table and the existing global Faq:
        1. What can I actually do on Free?
        2. Can I BYO CourtListener token?
        3. What happens if I hit 50,000 API calls in a day?
        4. What counts as a "seat" on Team?
        5. Annual discount?
        6. How does cancellation work?
        7. Refund policy?
        8. Can I export my data if I leave?
      Implemented as native `<details>` elements (no client
      component, native keyboard a11y, chevron rotates via
      `group-open:rotate-180`). Answers cross-link to
      /docs/api-reference for the API rate-limit details and to
      Settings → Billing / Settings → Export. The global product
      `<Faq />` (legality, state courts, alert speed, etc.) still
      ships below.
- [x] Watchlist starter templates on the empty /watchlists state.
      Six prebuilt suggestions spanning every entity type we
      support: Apple Inc. (party), Hon. Alsup (judge),
      Kirkland & Ellis (lawfirm), Securities §10(b) — SDNY,
      Patent suits — E.D. Tex., Antitrust — D.D.C. (all term
      searches with NOS + court filters). Each card is a deep-link
      to /watchlists/new with `?template=&type=&name=&match=&courts=&nos=`
      params; the new-watchlist form now reads them via
      `useSearchParams()` in its useState initialisers and shows a
      "Pre-filled from template tpl_xxx" hint badge with a "pick
      different" backlink to `/watchlists?empty=1`. New files:
      `src/lib/watchlist-templates.ts` (typed templates +
      templateHref builder) and `src/components/app/watchlist-suggestions.tsx`
      (icon-per-card grid). /watchlists now accepts `?empty=1` to
      preview the empty state (matches the dashboard convention).
- [x] Per-route sitemap priority + changeFrequency tune-up.
      Replaced the flat `priority: 0.7, freq: weekly` default
      with a per-route RouteSpec table. Resulting distribution:
        1.0  home (daily)
        0.9  /pricing, /demo (monthly, daily)
        0.85 /docs/api-reference (monthly)
        0.8  /blog, /docs, /vs/pacer, /vs/lex-machina,
             /comparison, persona pages (/use/*)
        0.7  blog posts, public docs, /changelog
        0.6  /about, /contact, /glossary, /jurisdictions,
             /lookup, /widget, demo dockets (daily)
        0.5  /press, /security, /donate, /tools/verify-webhook,
             /feeds
        0.4  /status, /shortcuts, /signup, /legal/data-sources
        0.3  feed routes (hourly), /login, /legal/{privacy,
             terms}, /feeds.opml
      changeFrequency tuned per surface: feeds hourly (so
      aggregators re-crawl), /demo daily, /status hourly,
      /legal/* yearly, etc. Comment block at the top documents
      the weighting rationale.
- [x] /robots.txt expanded with belt-and-suspenders Disallow for
      /widget/dkt_ (per-docket iframe pages — already noindex via
      metadata but reinforced here), /inbox, /audit-log,
      /email-preview, /.well-known/. /widget *index* (snippet
      generator) stays allowed. Expanded Allow list to match the
      sitemap (changelog, docs, jurisdictions, glossary, feeds,
      tools). Comment block at the top documents the two-layer
      "bouncer vs belt-and-suspenders" policy.
- [x] Markdown heading anchor ids in the in-house renderer.
      Every `## …` and `### …` now ships `id="kebab-slug"` so
      arbitrary headings are linkable; headings that start with a
      SemVer `X.Y.Z` prefix also ship a hidden `<a id="X.Y.Z">`
      alias anchor (sibling element with `scroll-mt-24`-style
      offset). Lets the changelog feed's `#0.1.2` permalinks
      actually scroll to the right section without forcing the
      slugger to know about version syntax. `scroll-mt-24`
      utility on the heading itself accounts for the sticky
      site-header height. Verified: /changelog renders ids
      `0.1.0`, `0.1.1`, `0.1.2` plus their kebab-slug siblings
      (e.g. `012-2026-05-24-developer-surface-syndication`); other
      Markdown-rendered docs (/docs/architecture etc.) still 200.
- [x] CHANGELOG.md 0.1.2 — 2026-05-24 (developer surface +
      syndication). Captures every wakeup of this loop session:
      api/health, openapi.json, /widget + /widget/json,
      /api/oembed, /api/widget-ping + dashboard "your embeds"
      card, /api/v1/dockets/{id}/ai-summaries, /api/widget-stats,
      /tools/verify-webhook, saved-search RSS + Atom + JSON Feed
      (+ format picker + content-negotiation), /blog + /changelog
      Atom/JSON mirrors, site-wide feed `<link>` discovery, /feeds
      hub, /feeds.opml, site-footer Feeds + retargeted API ref,
      blog API-ref CTA. Auto-flowed into /changelog page and all
      three changelog feeds (verified: feed.xml, feed.atom, and
      feed.json all show '0.1.2 — 2026-05-24' as the newest item).
- [x] Blog post CTA: Engineering-tagged posts now end with a card
      pitching `/docs/api-reference` (interactive renderer with
      copy-paste curl per endpoint). Conditional on `post.tag ===
      "Engineering"` — non-engineering posts (PACER essay, etc.)
      stay clean. Sits between the article body and the feedback
      line, styled with the same accent-soft gradient used on the
      /docs callout. Verified: shows on the extractive-architecture
      post; absent on the PACER post.
- [x] Site footer: "Feeds" link in Resources (one click to /feeds
      from any marketing page). Also retargeted the "API reference"
      link from /docs/api (the markdown doc) to /docs/api-reference
      (the interactive renderer) since the interactive page is the
      better default entry point. Removed the duplicate Press kit
      that previously appeared in both Resources and Company.
- [x] `/feeds.opml` — OPML 2.0 bundle of the public marketing feeds.
      Spec-compliant envelope (head/title/dateCreated/ownerName/
      ownerEmail/docs + body with two RSS outlines). Bundles only
      the canonical RSS variants — readers dedupe by xmlUrl, so
      listing all three formats of the same source would produce
      phantom feeds. Saved-search feeds are intentionally excluded
      (per-user URLs shouldn't go in a shared file). text/x-opml
      content type, content-disposition inline with a filename so
      readers prompt to save when downloaded. 3600s cache,
      24h SWR. Linked from /feeds via a download button. Sitemap
      updated.
- [x] `/feeds` index page — single human-readable hub listing every
      feed DocketLens publishes. Three sections:
        1. Blog (Public badge) — 3-row table per format with
           absolute URL + copy button.
        2. Changelog (Public badge) — same shape.
        3. Saved searches (Per-user badge) — URL template
           (`/api/v1/saved-searches/{id}/feed.{xml|atom|json}` with
           full query-param list), one fully-resolved example with
           a copy button, and a restated "the URL is the secret"
           warning.
      Plus an "Auto-discovery" callout explaining the site-wide
      `<link rel="alternate">` discovery story (browser RSS
      plugins + Feedbin auto-detect). Linked from sitemap. Mirrors
      how Pinboard, jeremy.codes, etc. surface their feeds.
- [x] Site-wide feed auto-discovery + format mirrors for /blog and
      /changelog. Six new sibling routes:
        /blog/feed.atom       (Atom 1.0)
        /blog/feed.json       (JSON Feed 1.1)
        /changelog/feed.atom  (Atom 1.0)
        /changelog/feed.json  (JSON Feed 1.1)
      All four reuse the existing in-house atom + jsonfeed
      emitters; same content/cache-control as the canonical RSS
      versions (revalidate=3600).
      Discovery tags emit as raw `<link rel="alternate">` elements
      inside root <head> (NOT via metadata.alternates.types) because
      per-page `alternates` (e.g. /demo/[id]'s oEmbed link)
      replaces the entire alternates block rather than merging its
      types map. Inline tags survive any per-page metadata.
      Verified: all 6 routes return 200 with correct content types
      (rss+xml, atom+xml, feed+json); /home ships 6 alternate links
      (RSS×2, Atom×2, JSON×2); /demo/[id] ships those 6 PLUS its
      per-docket json+oembed discovery. Sitemap lists all 6 feed
      URLs.
- [x] Format picker on the SavedSearchesPanel "Copy URL" action.
      The Rss row icon is now the trigger for a Dropdown menu with
      three options: RSS 2.0 (.xml), Atom 1.0 (.atom), JSON Feed
      1.1 (.json). Each option copies the absolute feed URL in
      that format (built via `feedUrl(s, ext)` so query params
      stay in sync). DropdownLabel + a small hint footer explain
      "RSS is the safe default; Atom for richer per-entry metadata;
      JSON Feed for modern readers." Toast description rephrased
      to "Paste it into any feed reader" so the copy works for all
      three formats. The Rss icon button retains its
      aria-label/title.
- [x] Atom 1.0 + JSON Feed 1.1 siblings of the saved-search RSS
      feed. Three sibling routes:
        /api/v1/saved-searches/{id}/feed.xml   → RSS 2.0
        /api/v1/saved-searches/{id}/feed.atom  → Atom 1.0
        /api/v1/saved-searches/{id}/feed.json  → JSON Feed 1.1
      All three share the same query params + result set via
      `runSearch()`. Two new in-house emitters:
        - `src/lib/atom.ts` — Atom 1.0 (atom:link self/alternate,
          per-entry `published` + `updated`, category terms,
          structured `<author>`)
        - `src/lib/jsonfeed.ts` — JSON Feed 1.1 (typed JsonFeed +
          JsonFeedItem, top-level authors[], home_page_url, tags)
      The canonical /feed.xml route also content-negotiates: a
      reader sending `Accept: application/atom+xml`,
      `Accept: application/feed+json`, or `?format=atom|json` gets a
      302 to the sibling. OpenAPI spec adds both new paths +
      reusable `SavedSearchId` parameter component. Discovery
      payload lists all three. Verified end-to-end:
        - feed.atom returns 6 entries with proper envelope;
        - feed.json?scope=patent returns 2 items, version
          'https://jsonfeed.org/version/1.1', tags array intact;
        - Accept: atom → 302 to feed.atom;
        - Accept: feed+json → 302 to feed.json;
        - ?format=atom → 302 to feed.atom.
- [x] "Copy RSS URL" button per saved-search row on /search. Sits
      next to Play/Delete with an Rss lucide-react icon. Click
      builds the absolute feed URL using `window.location.origin`,
      the saved-search id (as the {id} guid prefix), and the
      search's filters as URL params (q, court, nos, scope, name),
      then writes to clipboard with a sonner toast restating the
      "treat the URL like a secret — anyone with it can read this
      feed" warning. Graceful fallback if clipboard is blocked.
      Empty `scope=all` is omitted from the URL to keep it short.
- [x] Saved-search RSS feed — `GET /api/v1/saved-searches/{id}/feed.xml`
      with `?q=&court=&nos=&scope=&name=&limit=` query params. Renders
      RSS 2.0 via the in-house emitter; each item is one matching
      docket with title=`court · case_name`, description=top entry's
      one-liner + court/NOS/judge meta, categories = docket tags,
      pubDate = filing date. v0 carries the filter set through URL
      params (the `{id}` is a stable guid prefix); once DB-backed
      saved searches land, the id alone will suffice. Feed URL is
      the secret — treat it like a Calendly link. No auth (RSS
      readers rarely handle Bearer headers). Public 5-min edge
      cache with 1-hour SWR. `x-robots-tag: noindex` so search
      engines don't crawl per-user feeds. New helper
      `src/lib/search/filter.ts` (`runSearch`, `describeQuery`)
      shared with the /search page so the feed and the UI agree on
      results. OpenAPI + discovery updated. Verified end-to-end:
      empty query returns all 6 sample dockets; nos=410 narrows to
      the FTC antitrust case only; scope=patent returns Quantix MDL
      + Optera.
- [x] `/tools/verify-webhook` — client-side HMAC playground. Three
      inputs (signing secret · raw request body · X-DocketLens-
      Signature header), one "Verify" button that computes
      HMAC-SHA256 via the Web Crypto API and constant-time compares
      against the pasted signature. "Load sample" pre-fills with a
      demo secret + payload and auto-generates a matching signature
      so users can see the green path immediately. Result card
      shows expected vs received side-by-side; on mismatch surfaces
      the most common cause (body re-serialised before signing).
      Privacy card on the page restates that the secret never leaves
      the browser — no fetch, no logging, no analytics. Linked from
      /settings (Webhook signing). Sitemap updated.
- [x] `GET /api/widget-stats?id=dkt_…[&days=7]` — owner-side read
      interface to the privacy-preserving impression counters from
      /api/widget-ping. Returns `{ docket {id, case_name?, court?},
      window {days, from, to}, series [{day, count}], total,
      grand_total_all_dockets, meta { access_model, privacy,
      max_days } }`. Aggregate counts only — privacy invariant from
      the ping endpoint is restated in the response meta block.
      Requires Bearer auth (any plan) so anonymous scrapers can't
      enumerate docket popularity; documented as
      `access_model: "any_authenticated"` with a v0 note that
      future versions will narrow to org-scoped access via
      watchlist matches. Days clamped 1–30, defaults to 7. 400
      missing/malformed id, 401 unauth. private, max-age=60.
      OpenAPI spec + discovery endpoint updated with WidgetStats
      schema. Verified end-to-end: 401 unauth, 400 missing,
      400 malformed, 200 valid with case name resolved and
      sums correct.
- [x] `GET /widget/{id}/json` — JSON twin of the iframe widget. Same
      shape the HTML widget renders (case_name, court, docket_number,
      filed, judge, NOS, status, top 3 entries, parties, tags) so
      consumers can build their own card without scraping the
      rendered page. Strong ETag derived from the payload content
      (sha256 → base64url, first 24 chars) so when a new entry lands
      the ETag changes. Honors `If-None-Match` → 304 with no body.
      cache-control: public, max-age=300, SWR 86400 — same TTL as
      the iframe widget so they refresh in lockstep. HEAD + OPTIONS
      verbs honored. CORS-open. NOTE: under `next dev` Next.js
      strips If-None-Match to force fresh responses; in production
      the 304 branch fires correctly. Verified: 200 + payload shape
      + 24-char etag; HEAD 200 with etag; 404 for unknown id.
- [x] `GET /api/v1/dockets/{id}/ai-summaries` — tier-gated extractive
      summaries through the public REST API. Free-plan keys receive
      `one_liner` only; Pro+ keys receive all three tiers
      (one_liner, paragraph, exec). Each summary carries `content`,
      `source` ("cache" from `ai_summaries` table or "demo" from the
      seeded SAMPLE_DOCKETS), `prompt_version`, `model`, and `stale`
      (true if the cached row is older than the current
      PROMPT_VERSION — set after a prompt bump). Source resolution
      order: DB `ai_summaries` rows (preferring current PROMPT_VERSION,
      falling back to older rows with `stale: true`) → SAMPLE_DOCKETS
      seeds for the canonical demos → null. Returns `meta` block with
      `prompt_version_current`, `plan`, `tiers_returned`,
      `extractive_only: true`. 401 unauth, 404 unknown docket.
      Per-plan cache-control: public+SWR for free, private 60s for
      paid. Discovery endpoint, OpenAPI spec, and `AiSummaries` +
      `AiSummaryTier` schemas all updated. Verified end-to-end with
      minted free + pro test keys (since cleaned up):
        - free → tiers_returned = ['one_liner']
        - pro  → tiers_returned = ['one_liner', 'paragraph', 'exec']
        - paragraph source = "demo" for seeded entries
- [x] Dashboard "your embeds" card — surfaces the privacy-preserving
      widget-impression rollups. Shows the top 5 embedded dockets by
      load count (last 7 days) with a horizontal bar chart per row
      against the running max, plus a grand-total badge for the last
      30 days. Real case names + courts joined in from
      `SAMPLE_DOCKETS`. External-link icon opens the standalone
      widget. Empty state: explains the embed widget and links to
      `/widget`. New helper `widgetTopDockets(days, limit)` added to
      `src/lib/widget-pings.ts`. Card renders right after the
      Leaderboard section on /dashboard.
- [x] Widget impression counter — privacy-preserving aggregate
      pings. `GET /api/widget-ping?id=dkt_…` increments a
      `widget_pings` table keyed by (docket_id, UTC day) and returns
      a 42-byte transparent GIF. NO IP, user-agent, referrer,
      session, cookie, or fingerprint is stored — only the daily
      count. Hard no-store + no-cache headers so the pixel fires
      every render. Bad id still returns the GIF (4xx informational
      only) so the widget never shows a broken-image icon. The
      counter table is created lazily via `CREATE TABLE IF NOT
      EXISTS` in `src/lib/widget-pings.ts` (helpers:
      `recordWidgetImpression`, `widgetStats(docketId, days=7)`,
      `widgetTotal(days=30)`) — intentionally not in the Drizzle
      schema/migration pipeline, since it has nothing to migrate
      forward and shouldn't be coupled to user-data migrations.
      `/widget/[id]` renders the pixel off-screen
      (`left: -9999px`) so it's invisible. Verified end-to-end:
      multiple hits aggregate into one row per docket per day.
- [x] oEmbed 1.0 discovery — `GET /api/oembed?url=<docket-url>&format=json`
      returns `{ version, type: "rich", title, author_name (court),
      provider_name, provider_url, cache_age, html (the widget iframe
      tag), width, height }`. Accepts `maxwidth` / `maxheight`
      (clamped to widget's natural bounds, never up-scales).
      Unknown docket → 404; missing url → 400; XML → 501; CORS-open
      so client-side unfurlers (Notion, Ghost, WordPress, Slack)
      work. `/demo/[id]` now ships an `<link rel="alternate"
      type="application/json+oembed" …>` discovery tag via
      `generateMetadata.alternates.types`, so consumers can find the
      endpoint by parsing the docket page's `<head>`.
- [x] `/docs/api-reference` interactive API reference — renders the
      OpenAPI 3.1 spec directly from the typed `openapi` object (no
      Redoc, Scalar, or Stoplight JS bundle). Two-pane layout:
      sticky left-rail nav grouped by tag, right pane with one card
      per endpoint. Each card shows method · path · auth badge ·
      summary · description · parameters table · request body schema
      · per-status response schemas · auto-generated curl snippet
      (with Copy button). Schema renderer resolves `$ref` pointers
      inline (no "see Docket" hops) and merges `allOf` so
      DocketDetail shows fully resolved. Tags follow the order
      declared in `openapi.tags`. force-static. Sitemap updated.
      `/docs` index now has a callout card linking to the renderer.
- [x] `/widget/[id]` embeddable case widget — iframe-friendly card
      for journalists/bloggers. Renders court · case number · case
      name · filed date · judge · NOS · status · the three most
      recent docket entries · "Powered by DocketLens" attribution
      footer. Scoped CSS in `src/app/widget/widget.css` under
      `.docketlens-widget-root` so the cascade can't leak from a
      host page; OKLCH tokens redeclared locally; `prefers-color-
      scheme: dark` honored via `data-theme="auto"`. Framing
      permission set via `Content-Security-Policy: frame-ancestors *`
      in next.config.ts headers() for /widget/:path*; no
      X-Frame-Options is set. `/widget` itself is a marketing-style
      index that previews three live embeds, generates a copy-paste
      `<iframe>` snippet for each, and documents the attribution +
      no-tracking promises. noindex on widget instances; included in
      sitemap for the index page.
- [x] OpenAPI 3.1 spec served at `/api/v1/openapi.json` — hand-written
      typed `openapi` object in `src/lib/openapi.ts` describing every
      endpoint (discovery, dockets list+detail, search, watchlists
      list+create, health). Includes BearerAuth security scheme, named
      `parameters` + `responses` components, ten reusable schemas
      (Error, Discovery, Health, Docket, DocketDetail, DocketEntry,
      Party, SearchResult, Watchlist, CreateWatchlist), per-status
      response envelopes (401/402/404/422), tags grouped by domain,
      and dev + prod servers. force-static — regenerates on deploy.
      Discovery payload now references both `/api/v1/openapi.json`
      and `/api/health`. Compatible with Swagger UI / Redoc / Scalar /
      `openapi-typescript` codegen.

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
- [ ] **Fix matcher.ts tier-3 dead code** — agent's test pass
      flagged that the substring fallback never fires because
      tier-2 token-subset already eats every case it'd handle.
      Tighten tier-2 to require word boundaries on each token, or
      delete tier-3 outright and document the simpler model.
      Either way, the existing tests will guard the decision.
- [ ] **404 page redesign** — current /404 is generic. Add a
      "Did you mean?" block that fuzzy-matches the typed path
      against the sitemap and surfaces the 3 closest matches.
- [ ] **/status page real-meter wiring** — currently static. Wire
      the four indicator dots to actual `/api/health` polling on
      the client (1-min cadence) so it reflects reality.
- [ ] **Topbar command palette keyboard hint** — add a small
      `⌘K` chip inside the search input on /search and
      /dashboard so users discover the palette.
- [ ] **Empty-state for /alerts inbox** — currently shipped; tune
      the illustration (decorative SVG with reduced-motion guard)
      and add a "Send a test webhook" CTA.
- [ ] **Footer wordmark hover** — add a subtle 200ms accent
      underline-grow on the SiteFooter wordmark to match the
      header treatment.
- [ ] **Dockets/[id] entry anchors** — emit `id="entry-{n}"` on
      each timeline row so the `/dockets/{id}#entry-12` deep
      links from the dashboard "recent filings" feed actually
      scroll.

### Content
- [ ] **Fifth blog post** — "Three months of RECAP throughput:
      what a free public archive can and can't deliver in May
      2026." Engineering tag, ~7 min read, real numbers from
      ingest worker traces.
- [ ] **Sixth blog post** — "How we picked our pricing:
      anchoring to the Bloomberg Law seat, not to PACER's per-page
      cost." Industry tag. Covers the framing math.

### Features
- [ ] **/docs/structured-data.md internal doc** — single page
      listing every JSON-LD entity we ship and where, so future
      maintainers don't accidentally duplicate or contradict
      them. Pair with a one-paragraph "how to add a new entity"
      checklist.
- [ ] **Healthcheck includes CourtListener pool budget** —
      `/api/health` currently checks DB only. Extend with a
      best-effort cached read of the leaky-bucket budget so ops
      monitors can see when we're rate-limit-saturated.
- [ ] **`/api/v1/me`** — returns the current API key's plan,
      keyId, orgId, scopes, lastUsedAt, and the rate-limit
      remaining for the window. Standard endpoint every API has;
      we don't yet.
- [ ] **Webhook delivery dashboard** — read-only table on /alerts
      showing the last 30 webhook deliveries with status, latency,
      response code, and a retry button. Already have the
      schema for `alert_deliveries`.
- [ ] **Audit-log filter chips** — /audit-log currently shows a
      raw timeline. Add chips for `event_type` (sign-in, watchlist
      created, API key revoked, etc.) and a date range picker
      that drives URL params.
- [ ] **Saved-search "Run" preview** — clicking a saved search
      on /search currently sets the form; add a small in-place
      results count badge so users see "47 matches" without
      submitting.
- [ ] **/widget/[id]?theme=light|dark|auto** query param —
      already auto-themed; explicit override lets embedders match
      their host page's theme without media-query guesswork.
- [ ] **`<a hreflang="x-default">` on i18n-future pages** —
      placeholder for /pricing and /. Sets up the eventual
      i18n story without committing to translations now.
- [ ] **`/api/v1/courts`** — return the list of courts we cover
      (id, full_name, short_name, jurisdiction, in_use) so API
      consumers can populate dropdowns without scraping
      /jurisdictions.
- [ ] **Watchlist "share preview"** — read-only public URL like
      `/watchlists/{id}/preview` that shows the watchlist title +
      latest 5 matches without auth. Linkable in Slack/email.
      Owner can toggle on/off in settings.

### Auth (Tuesday wire-up — don't break the stub)
- [ ] Install Better-Auth, write the adapter, wire magic-link flow,
      Google OAuth gated on env. Schema is already ready.

### Parallel branches pending user merge (2026-05-25)
- [x] `worktree-agent-afbd4f9582cd409c9` — /comparison refresh
      (3 new competitors + at-a-glance matrix) + ARCHITECTURE,
      API, RUNBOOK doc refreshes. 4 commits. typecheck green.
      Not duplicated on main.

### Tests (shipped 2026-05-25 on a parallel branch)
- [x] 134 vitest tests landed on
      `worktree-agent-a15024f436e5cce40` (NOT merged to main —
      user supervises merges). Coverage:
        filter           41 tests
        matcher          45 tests + 1 documented skip
        structured-data  29 tests
        widget-pings     19 tests
      .github/workflows/ci.yml extended to run `pnpm test` after
      typecheck. docs/TESTING.md added.
      **Dead-code finding worth fixing**: `matcher.ts` tier-3
      substring fallback is unreachable — any single-token
      needle hits tier-2 first; multi-token needles whose literal
      appears as substring also satisfy tokens-in-order. To make
      tier-3 reachable, tighten tier-2 to a word-boundary token
      check.

### Operating cadence (refresh 2026-05-25)
- Wakeups now fire every ~270s (cache-friendly) instead of 1800s.
- Per tick, do 3–5 items from this queue rather than one.
- When the queue dips below 10 open items, refill aggressively
  from what you noticed while building — don't let it run dry.

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
