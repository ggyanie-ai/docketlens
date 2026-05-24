import { POSTS } from "@/content/posts";
import { renderJsonFeed } from "@/lib/jsonfeed";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  Blog JSON Feed 1.1 — sibling of /blog/feed.xml.
 *
 *  Identical content to the RSS + Atom siblings. JSON-Feed-aware readers
 *  (Reeder 5, NetNewsWire 6+, Inoreader) prefer this; XML escaping bugs
 *  can't happen.
 * ==========================================================================*/

export async function GET() {
  const feed = renderJsonFeed(
    {
      title: "DocketLens — blog",
      homepage: `${SITE}/blog`,
      feedUrl: `${SITE}/blog/feed.json`,
      description:
        "Notes from the workbench at DocketLens — federal court data, AI summarization, and pricing experiments. Build-in-public, mostly.",
      language: "en-US",
      author: { name: "DocketLens", url: SITE },
    },
    POSTS.map((p) => ({
      id: `${SITE}/blog/${p.slug}`,
      url: `${SITE}/blog/${p.slug}`,
      title: p.title,
      summary: p.excerpt,
      content_text: p.excerpt,
      date_published: `${p.date}T12:00:00.000Z`,
      authors: [{ name: p.author }],
      tags: [p.tag],
    }))
  );

  return new Response(JSON.stringify(feed), {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
