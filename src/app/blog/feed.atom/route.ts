import { POSTS } from "@/content/posts";
import { renderAtom } from "@/lib/atom";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  Blog Atom 1.0 feed — sibling of /blog/feed.xml.
 *
 *  Same posts, same source — only the envelope changes. Atom carries
 *  per-entry `updated` separately from `published`, which some readers
 *  use to flag re-edited posts.
 * ==========================================================================*/

export async function GET() {
  const xml = renderAtom(
    {
      title: "DocketLens — blog",
      feedUrl: `${SITE}/blog/feed.atom`,
      siteUrl: `${SITE}/blog`,
      id: `${SITE}/blog`,
      subtitle:
        "Notes from the workbench at DocketLens — federal court data, AI summarization, and pricing experiments. Build-in-public, mostly.",
      language: "en-US",
    },
    POSTS.map((p) => ({
      id: `${SITE}/blog/${p.slug}`,
      title: p.title,
      link: `${SITE}/blog/${p.slug}`,
      published: `${p.date}T12:00:00Z`,
      summary: p.excerpt,
      author: p.author,
      categories: [p.tag],
    }))
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
