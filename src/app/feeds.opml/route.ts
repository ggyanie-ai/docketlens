export const runtime = "nodejs";
export const revalidate = 3600;

/* ============================================================================
 *  GET /feeds.opml
 *
 *  OPML 2.0 (http://opml.org/spec2.opml) bundle of the public DocketLens
 *  feeds. Most RSS readers (NetNewsWire, Reeder, Inoreader, Feedbin,
 *  Vienna, Vivaldi, Kagi) support one-click "Import OPML" — drop this URL
 *  in and the reader subscribes to every entry inside one folder.
 *
 *  We only bundle the canonical RSS variants (not the Atom/JSON siblings)
 *  because readers dedupe by xmlUrl, not by content — listing all three of
 *  the same source produces phantom feeds. Readers that prefer Atom or
 *  JSON Feed can swap the URL post-import.
 *
 *  Saved-search feeds are intentionally NOT in the OPML — each one is a
 *  per-user URL that we shouldn't list in a shared file.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

interface OpmlFeed {
  title: string;
  xmlUrl: string;
  htmlUrl: string;
  description?: string;
}

const FEEDS: OpmlFeed[] = [
  {
    title: "DocketLens — blog",
    xmlUrl: `${SITE}/blog/feed.xml`,
    htmlUrl: `${SITE}/blog`,
    description:
      "Notes from the workbench at DocketLens — federal court data, AI summarization, and pricing experiments.",
  },
  {
    title: "DocketLens — changelog",
    xmlUrl: `${SITE}/changelog/feed.xml`,
    htmlUrl: `${SITE}/changelog`,
    description: "Every shipped release of DocketLens, by ISO date.",
  },
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const now = new Date().toUTCString();

  const outlines = FEEDS.map(
    (f) =>
      `      <outline type="rss" version="RSS2" text="${esc(
        f.title
      )}" title="${esc(f.title)}" xmlUrl="${esc(f.xmlUrl)}" htmlUrl="${esc(
        f.htmlUrl
      )}"${f.description ? ` description="${esc(f.description)}"` : ""}/>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>DocketLens feeds</title>
    <dateCreated>${esc(now)}</dateCreated>
    <ownerName>DocketLens</ownerName>
    <ownerEmail>support@docketlens.ai</ownerEmail>
    <docs>http://opml.org/spec2.opml</docs>
  </head>
  <body>
    <outline text="DocketLens" title="DocketLens">
${outlines}
    </outline>
  </body>
</opml>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      // text/x-opml is the formal media type; many tools also accept
      // application/xml. We send the formal one and let content sniffing
      // do the rest.
      "content-type": "text/x-opml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      // Encourage the browser to download rather than render.
      "content-disposition": 'inline; filename="docketlens-feeds.opml"',
    },
  });
}
