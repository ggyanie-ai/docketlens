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
