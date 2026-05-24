import type { MetadataRoute } from "next";
import { POSTS } from "@/content/posts";
import { PUBLIC_DOCS } from "@/content/public-docs";
import { PERSONAS } from "@/content/personas";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/pricing",
    "/about",
    "/demo",
    "/blog",
    "/press",
    "/changelog",
    "/docs",
    "/contact",
    "/vs/pacer",
    "/vs/lex-machina",
    "/comparison",
    "/status",
    "/jurisdictions",
    "/security",
    "/shortcuts",
    "/donate",
    "/lookup",
    "/glossary",
    "/widget",
    "/legal/privacy",
    "/legal/terms",
    "/legal/data-sources",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const blogRoutes = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const demoRoutes = SAMPLE_DOCKETS.map((d) => ({
    url: `${SITE}/demo/${d.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  const docRoutes = PUBLIC_DOCS.map((d) => ({
    url: `${SITE}/docs/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const personaRoutes = PERSONAS.map((p) => ({
    url: `${SITE}/use/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...demoRoutes,
    ...docRoutes,
    ...personaRoutes,
  ];
}
