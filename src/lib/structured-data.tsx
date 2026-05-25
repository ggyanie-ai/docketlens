import type { ReactElement } from "react";

/* ============================================================================
 *  schema.org structured-data helpers (BreadcrumbList focus)
 *
 *  Tiny island components that emit `<script type="application/ld+json">`
 *  for crawler-only consumption. No client JS, no React hydration cost.
 *  Pair these with the FAQPage block on /pricing and the
 *  SoftwareApplication block on /.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export interface BreadcrumbItem {
  /** Display name shown in SERPs. */
  name: string;
  /** Relative or absolute URL. Relative paths are joined to SITE. */
  url: string;
}

/**
 * Render a JSON-LD `<script>` for a BreadcrumbList. Always include the home
 * page as the first item; this matches what Google's rich-results test
 * expects for sane IA.
 *
 * Usage:
 *   <BreadcrumbJsonLd items={[
 *     { name: "Home", url: "/" },
 *     { name: "Blog", url: "/blog" },
 *     { name: post.title, url: `/blog/${post.slug}` },
 *   ]} />
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: BreadcrumbItem[];
}): ReactElement | null {
  if (items.length === 0) return null;
  const payload = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE}${it.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export interface ArticleMeta {
  /** Headline shown in News + Discover cards. */
  headline: string;
  /** Short summary. */
  description: string;
  /** Canonical absolute or relative URL. */
  url: string;
  /** ISO 8601 date (YYYY-MM-DD acceptable; we normalise to RFC 3339). */
  datePublished: string;
  /** ISO 8601 date for last modification. Defaults to datePublished. */
  dateModified?: string;
  /** Author display name. */
  authorName: string;
  /** "Engineering" / "Product" / etc. — drives section + article subtype. */
  section: string;
  /** Optional image URL (absolute or relative). */
  image?: string;
}

/**
 * Article JSON-LD with subtype selection. Engineering-tagged posts emit
 * `TechArticle`, everything else emits `NewsArticle`. The `mainEntityOfPage`
 * + `publisher` fields let Google tie the post back to the Organization
 * entity on /about.
 */
export function ArticleJsonLd({ meta }: { meta: ArticleMeta }): ReactElement {
  const isTech = /engineer/i.test(meta.section);
  const url = meta.url.startsWith("http") ? meta.url : `${SITE}${meta.url}`;
  const image = meta.image
    ? meta.image.startsWith("http")
      ? meta.image
      : `${SITE}${meta.image}`
    : `${SITE}/opengraph-image`;
  const datePublished = /\d{4}-\d{2}-\d{2}T/.test(meta.datePublished)
    ? meta.datePublished
    : `${meta.datePublished}T12:00:00Z`;
  const payload = {
    "@context": "https://schema.org",
    "@type": isTech ? "TechArticle" : "NewsArticle",
    headline: meta.headline,
    description: meta.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished,
    dateModified: meta.dateModified
      ? /\d{4}-\d{2}-\d{2}T/.test(meta.dateModified)
        ? meta.dateModified
        : `${meta.dateModified}T12:00:00Z`
      : datePublished,
    author: { "@type": "Organization", name: meta.authorName, url: SITE },
    publisher: {
      "@type": "Organization",
      name: "DocketLens",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/icon.png` },
    },
    articleSection: meta.section,
    image,
    inLanguage: "en-US",
    isAccessibleForFree: true,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/**
 * WebSite JSON-LD with a SearchAction. Mounting on `/` makes the site
 * eligible for Google's sitelinks search box treatment — a small search
 * input rendered directly under the site's SERP entry that submits to
 * `/search?q=…`.
 *
 * The required-input `{search_term_string}` placeholder must remain
 * literal in the URL template; Google substitutes it at search time. The
 * `query-input` value is the required structured-data assertion.
 */
export function WebSiteJsonLd(): ReactElement {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: "DocketLens",
    alternateName: "DocketLens — AI court docket intelligence",
    url: SITE,
    description:
      "AI-summarized federal court dockets. Watch any party, judge, or law firm.",
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: "DocketLens", url: SITE },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/**
 * Render a JSON-LD `<script>` for an Organization. Pairs with the
 * SoftwareApplication entity on `/` — Google resolves them through the
 * shared `publisher` field. Mount on `/about` so the entity has a stable
 * canonical home.
 */
export function OrganizationJsonLd(): ReactElement {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DocketLens",
    url: SITE,
    logo: `${SITE}/icon.png`,
    description:
      "AI-summarized federal court dockets. Watch any party, judge, or law firm — get a digest the next morning. The PACER alternative.",
    foundingDate: "2026",
    email: "support@docketlens.ai",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@docketlens.ai",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://github.com/donnowyu/docketlens",
      "https://x.com/docketlens",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
