import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/about", "/demo", "/blog", "/legal/"],
        disallow: ["/dashboard", "/watchlists", "/alerts", "/settings", "/api/", "/api-keys"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
