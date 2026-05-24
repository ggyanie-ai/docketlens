import type { MetadataRoute } from "next";
import { POSTS } from "@/content/posts";
import { PUBLIC_DOCS } from "@/content/public-docs";
import { PERSONAS } from "@/content/personas";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

type Freq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/* ============================================================================
 *  Per-route sitemap weighting
 *
 *  Priority is relative — Google has stated it doesn't influence ranking
 *  directly, but it does help disambiguate crawl order within a domain.
 *  We bias toward conversion-adjacent surfaces (home, pricing, persona
 *  pages) and away from boilerplate (legal, login, status, feed XML).
 *
 *  changeFrequency is a hint, not a guarantee. We pin feeds to `hourly`
 *  so reader-aggregators re-crawl quickly; legal pages to `yearly`.
 * ==========================================================================*/

interface RouteSpec {
  path: string;
  priority: number;
  freq: Freq;
}

const STATIC_ROUTES: RouteSpec[] = [
  // Top-of-funnel
  { path: "", priority: 1.0, freq: "daily" },
  { path: "/pricing", priority: 0.9, freq: "monthly" },
  { path: "/demo", priority: 0.9, freq: "daily" },

  // High-intent comparisons
  { path: "/vs/pacer", priority: 0.8, freq: "monthly" },
  { path: "/vs/lex-machina", priority: 0.8, freq: "monthly" },
  { path: "/comparison", priority: 0.8, freq: "monthly" },

  // Content hubs
  { path: "/blog", priority: 0.8, freq: "daily" },
  { path: "/docs", priority: 0.8, freq: "monthly" },
  { path: "/docs/api-reference", priority: 0.85, freq: "monthly" },
  { path: "/changelog", priority: 0.7, freq: "weekly" },
  { path: "/glossary", priority: 0.6, freq: "monthly" },
  { path: "/jurisdictions", priority: 0.6, freq: "monthly" },

  // Brand / about
  { path: "/about", priority: 0.6, freq: "monthly" },
  { path: "/contact", priority: 0.6, freq: "monthly" },
  { path: "/press", priority: 0.5, freq: "monthly" },

  // Tools + utilities
  { path: "/lookup", priority: 0.6, freq: "monthly" },
  { path: "/tools/verify-webhook", priority: 0.5, freq: "monthly" },
  { path: "/widget", priority: 0.6, freq: "monthly" },
  { path: "/feeds", priority: 0.5, freq: "monthly" },
  { path: "/feeds.opml", priority: 0.3, freq: "monthly" },

  // Light-touch utility pages
  { path: "/security", priority: 0.5, freq: "yearly" },
  { path: "/donate", priority: 0.5, freq: "yearly" },
  { path: "/shortcuts", priority: 0.4, freq: "yearly" },
  { path: "/status", priority: 0.4, freq: "hourly" },

  // Feeds — hourly so aggregators re-crawl quickly
  { path: "/blog/feed.xml", priority: 0.3, freq: "hourly" },
  { path: "/blog/feed.atom", priority: 0.3, freq: "hourly" },
  { path: "/blog/feed.json", priority: 0.3, freq: "hourly" },
  { path: "/changelog/feed.xml", priority: 0.3, freq: "hourly" },
  { path: "/changelog/feed.atom", priority: 0.3, freq: "hourly" },
  { path: "/changelog/feed.json", priority: 0.3, freq: "hourly" },

  // Auth — visible but low-value for SERPs
  { path: "/signup", priority: 0.4, freq: "yearly" },
  { path: "/login", priority: 0.3, freq: "yearly" },

  // Boilerplate
  { path: "/legal/privacy", priority: 0.3, freq: "yearly" },
  { path: "/legal/terms", priority: 0.3, freq: "yearly" },
  { path: "/legal/data-sources", priority: 0.4, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = STATIC_ROUTES.map((r) => ({
    url: `${SITE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const blogRoutes = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Per-docket demo pages: shareable + canonical for the oEmbed widget.
  // Higher priority than the 0.4 floor we used before.
  const demoRoutes = SAMPLE_DOCKETS.map((d) => ({
    url: `${SITE}/demo/${d.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const docRoutes = PUBLIC_DOCS.map((d) => ({
    url: `${SITE}/docs/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Persona pages convert; weight higher than general content.
  const personaRoutes = PERSONAS.map((p) => ({
    url: `${SITE}/use/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...demoRoutes,
    ...docRoutes,
    ...personaRoutes,
  ];
}
