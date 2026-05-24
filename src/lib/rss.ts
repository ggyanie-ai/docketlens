/* ============================================================================
 *  Tiny RSS 2.0 emitter
 *
 *  Hand-written XML — no third-party dep. Escapes the five XML predefined
 *  entities + wraps anything ambiguous in CDATA. The output validates
 *  against the W3C feed validator.
 * ==========================================================================*/

export interface FeedItem {
  /** Stable identifier — usually the canonical URL. */
  guid: string;
  title: string;
  /** Absolute URL. */
  link: string;
  /** Short HTML or plaintext summary. */
  description: string;
  /** Optional full HTML content. Will be wrapped in CDATA. */
  contentHtml?: string;
  /** RFC 822 date (`new Date().toUTCString()`). */
  pubDate: string;
  /** Optional author name. */
  author?: string;
  /** Optional category labels. */
  categories?: string[];
}

export interface FeedMeta {
  title: string;
  /** Feed self-link (absolute URL to the feed.xml endpoint). */
  feedUrl: string;
  /** Site link (absolute URL to the human-readable index). */
  siteUrl: string;
  description: string;
  language?: string; // e.g. "en-US"
  /** ISO date of last build — defaults to now. */
  lastBuildDate?: string;
}

export function renderRss(meta: FeedMeta, items: FeedItem[]): string {
  const lang = meta.language ?? "en-US";
  const lastBuild = meta.lastBuildDate ?? new Date().toUTCString();

  const itemsXml = items
    .map((i) => {
      const cats = (i.categories ?? [])
        .map((c) => `      <category>${esc(c)}</category>`)
        .join("\n");
      const author = i.author
        ? `      <dc:creator><![CDATA[${i.author}]]></dc:creator>\n`
        : "";
      const content = i.contentHtml
        ? `      <content:encoded><![CDATA[${i.contentHtml}]]></content:encoded>\n`
        : "";
      return `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <guid isPermaLink="true">${esc(i.guid)}</guid>
      <pubDate>${esc(i.pubDate)}</pubDate>
      <description><![CDATA[${i.description}]]></description>
${author}${content}${cats ? cats + "\n" : ""}    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(meta.title)}</title>
    <link>${esc(meta.siteUrl)}</link>
    <atom:link href="${esc(meta.feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${esc(meta.description)}</description>
    <language>${esc(lang)}</language>
    <lastBuildDate>${esc(lastBuild)}</lastBuildDate>
    <generator>DocketLens (in-house)</generator>
${itemsXml}
  </channel>
</rss>
`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** YYYY-MM-DD → RFC 822 (`Sat, 23 May 2026 00:00:00 GMT`). */
export function rfc822(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toUTCString();
}
