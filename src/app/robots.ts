import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  /robots.txt
 *
 *  Two-layer policy that pairs with the per-page metadata.robots noindex
 *  hints — robots.txt is the bouncer, the meta tags are belt-and-suspenders.
 *
 *  Disallowed surfaces:
 *   - Authenticated app routes (dashboard, watchlists, alerts, settings,
 *     inbox, audit-log, api-keys) — there's no value in indexing UI
 *     chrome that requires sign-in.
 *   - All /api/* — JSON endpoints, not human content.
 *   - /widget/[id] — embeddable iframes shouldn't show up as standalone
 *     search results (they look broken without their host page).
 *     The /widget *index* (snippet generator) is fine to crawl, so we
 *     pin the disallow to /widget/ paths with a trailing segment.
 *   - /email-preview — internal dev tool.
 *   - /.well-known/ — security.txt etc., not for SERPs.
 * ==========================================================================*/

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/about",
          "/demo",
          "/blog",
          "/changelog",
          "/docs",
          "/jurisdictions",
          "/glossary",
          "/legal/",
          "/feeds",
          "/widget", // index OK
          "/tools/",
        ],
        disallow: [
          "/dashboard",
          "/watchlists",
          "/alerts",
          "/settings",
          "/inbox",
          "/audit-log",
          "/api-keys",
          "/api/",
          "/widget/dkt_", // per-docket iframe pages — indexable would look broken
          "/email-preview",
          "/.well-known/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
