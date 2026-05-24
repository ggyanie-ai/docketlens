import { POSTS } from "@/content/posts";
import { renderRss, rfc822 } from "@/lib/rss";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export async function GET() {
  const xml = renderRss(
    {
      title: "DocketLens — blog",
      feedUrl: `${SITE}/blog/feed.xml`,
      siteUrl: `${SITE}/blog`,
      description:
        "Notes from the workbench at DocketLens — federal court data, AI summarization, and pricing experiments. Build-in-public, mostly.",
      language: "en-US",
    },
    POSTS.map((p) => ({
      guid: `${SITE}/blog/${p.slug}`,
      title: p.title,
      link: `${SITE}/blog/${p.slug}`,
      pubDate: rfc822(p.date + "T12:00:00Z"),
      description: p.excerpt,
      author: p.author,
      categories: [p.tag],
    }))
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
