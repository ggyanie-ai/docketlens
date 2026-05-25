# Structured data inventory

Single source of truth for every schema.org JSON-LD entity DocketLens
ships. If you're adding a new page that should appear in rich results,
add the entry here first so future maintainers don't accidentally
duplicate or contradict them.

All helpers live in `src/lib/structured-data.tsx`. Mount them at the top
of the page component (before `<SiteHeader />`) so the script tags land
in `<body>` early.

## What we ship today

| Page | Entity | Helper |
| --- | --- | --- |
| `/` | `SoftwareApplication` (inline) | inlined `SOFTWARE_LD` in `src/app/page.tsx` |
| `/` | `WebSite` + `SearchAction` | `<WebSiteJsonLd />` |
| `/about` | `Organization` | `<OrganizationJsonLd />` |
| `/about` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |
| `/pricing` | `FAQPage` (8 questions) | inline `<script>` in `src/app/pricing/page.tsx` |
| `/blog/[slug]` | `TechArticle` (Engineering) or `NewsArticle` | `<ArticleJsonLd meta=… />` |
| `/blog/[slug]` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |
| `/docs/[slug]` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |
| `/demo/[id]` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |
| `/legal/data-sources` | `Dataset` | `<DatasetJsonLd />` |
| `/legal/data-sources` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |
| `/tools/verify-webhook` | `HowTo` (3 steps) | `<HowToJsonLd … />` |
| `/tools/verify-webhook` | `BreadcrumbList` | `<BreadcrumbJsonLd items=[…] />` |

## Entity relationships

- **`Organization` on `/about` is the canonical company entity.**
  Everything else points to it via `publisher.name = "DocketLens"`
  and `publisher.url = $SITE`.
- **`SoftwareApplication` on `/` is the product entity.** Its
  `publisher` field re-asserts the same `Organization` so Google
  can resolve them as a single org.
- **`WebSite` on `/` has a stable `@id = ${SITE}/#website`.** Other
  entities can reference it via `isPartOf` once we need to express
  containment (we don't yet).
- **`Dataset` on `/legal/data-sources` lists `creator = Free Law
  Project` and `publisher = DocketLens`.** We are not the dataset's
  originator — RECAP is. Keep this distinction; misrepresenting
  authorship of public records is bad form.

## How to add a new entity

1. **Pick the schema.** Use
   [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
   to see which schema gets a rich card for your target query.
2. **Add a helper to `src/lib/structured-data.tsx`.** Follow the
   existing pattern: a single function that returns
   `<script type="application/ld+json" />` with the payload built
   from a typed `Meta` interface. Doc-comment what it's for and what
   rich result it targets.
3. **Mount on the page.** First child of the JSX root, before any
   visible UI. This keeps the `<script>` tag close to the top of
   `<body>` so crawlers see it without parsing the whole tree.
4. **Add a row to the table above.**
5. **Verify** with `curl -s <url> | python3 -c "…"` — extract the
   script, JSON.parse, assert the expected shape. Examples are in
   the commit messages for `682766f`, `c8bccac`, `bd82668`,
   `eae026b`, `33076f7`, `20c1142`, `d4be156`, `893929a`.

## Rules

- **One entity per `@type` per page.** Don't ship two `Organization`
  blocks on `/about`; pick one and put the fields there.
- **No fabricated `aggregateRating`.** Google de-ranks fake review
  counts. We'll add it back once there are real reviews.
- **Plain text in `acceptedAnswer.text` and `description`.** HTML is
  legal but the snippet that lands in SERPs is the plain version,
  so write for the SERP.
- **Absolute URLs.** Helpers normalise relative paths to
  `${NEXT_PUBLIC_APP_URL}${path}` so don't paste `/about` into a
  raw payload — pass it through the helper.
- **Don't drift.** Prices in `SoftwareApplication.offers[]` must
  match what `<PricingPreview>` shows. If you change one, change
  the other.

## What we deliberately don't ship

- `Review` / `aggregateRating` — no real reviews yet.
- `Event` — we don't run events.
- `Service` — would overlap with `SoftwareApplication`; pick one.
- `JobPosting` — when we're hiring, add it on `/about` (not on
  its own page) so it links to the Organization entity.
