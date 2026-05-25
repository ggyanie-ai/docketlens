# Testing — 0.2.0

DocketLens's unit-test layer. Anything that requires a running browser
or a real network call lives in the 0.2.1 Playwright suite (not yet
shipped); this doc covers what the `pnpm test` command does today.

## Running

```bash
pnpm test          # one-shot, used by CI
pnpm test:watch    # vitest in watch mode for local development
```

The runner is [vitest](https://vitest.dev) backed by:

- `node` environment by default (most tests are pure functions, drizzle
  queries, or server-only modules).
- `happy-dom` available per-file via the magic
  `// @vitest-environment happy-dom` comment for the handful of tests
  that need DOM APIs.
- `@vitest/coverage-v8` for `--coverage` reports.

The config lives at `vitest.config.ts`. The `@/*` alias resolves to
`./src/*` to match `tsconfig.json`.

## What's covered

### `src/lib/search/filter.test.ts` — 41 tests

`runSearch()` + `describeQuery()` — the dataset filter shared by the
`/search` page and the saved-search RSS feeds. Empty queries, court /
NOS / scope narrowing, free-text matching across case name + party
name + judge + docket number, AND-combination of filters, and the
newest-first sort.

### `src/lib/alerts/matcher.test.ts` — 45 tests + 1 skip

`matchWatchlist()` + `normalizeEntityName()` — the deterministic
watchlist matcher that drives every email, webhook, and RSS dispatch.
Covers the 3-tier precedence (exact > token-subset > substring),
entity-type-aware lookups (party / attorney / judge / lawfirm / case /
term), filter gates (court, NOS-prefix, date window), and corporate-
suffix stripping. One skip documents that the tier-3 substring fallback
is functionally unreachable for multi-token needles — left as a TODO
to either remove the dead branch or tighten tier-2 to word boundaries.

### `src/lib/structured-data.test.tsx` — 29 tests

All six JSON-LD helpers (`BreadcrumbJsonLd`, `OrganizationJsonLd`,
`WebSiteJsonLd`, `DatasetJsonLd`, `ArticleJsonLd`, `HowToJsonLd`).
Each test renders the helper via `renderToStaticMarkup`, extracts the
JSON-LD payload with a regex, and asserts the schema.org shape that
Google's Rich Results test expects. `ArticleJsonLd` specifically: the
`TechArticle` vs `NewsArticle` subtype selection based on `section`.

### `src/lib/widget-pings.test.ts` — 19 tests

The widget-impression counter, wired through an in-memory libSQL
database (`:memory:`) via `vi.mock("@/lib/db")`. Exercises the real
SQL the module emits — `INSERT … ON CONFLICT DO UPDATE`, the daily
window aggregation, and the `widgetTopDockets` group-by. Covers
`recordWidgetImpression` (idempotent upsert), `widgetStats` (daily
series), `widgetTopDockets` (top N descending), and `widgetTotal`
(grand sum with window).

## What is intentionally NOT covered yet

These belong in 0.2.1 Playwright territory; vitest would just be
mocking everything important.

- **Route handlers** — every `app/.../route.ts`. Best tested against
  a running Next dev server with real HTTP.
- **UI components** — anything under `src/components/`. Hydration,
  click handlers, keyboard navigation, and theme toggling are all
  better-covered by end-to-end browser tests than by jsdom.
- **CourtListener client** — `src/lib/courtlistener/*`. We don't want
  to vcr-tape upstream API responses; an integration test against
  the public sandbox is more honest than a mock.
- **Email delivery** — `src/lib/alerts/email.ts` + `dispatch.ts`. The
  failure modes that matter (Resend outages, bounce handling) only
  happen against the live API.
- **AI summarization** — `src/lib/ai/*`. Anthropic responses are
  non-deterministic; integration tests live in `scripts/`.

## Adding tests

Co-locate test files next to the module they cover, named
`*.test.ts` or `*.test.tsx`. Vitest's `include` glob picks them up
automatically. Use the existing files as templates — they document
the patterns we lean on (vi.mock for swapping `@/lib/db`,
`renderToStaticMarkup` for TSX helpers).
