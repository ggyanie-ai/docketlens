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
