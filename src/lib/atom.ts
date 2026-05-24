/* ============================================================================
 *  Atom 1.0 emitter
 *
 *  Hand-written XML — no third-party dep. Mirrors src/lib/rss.ts so both
 *  feeds can share the same producer-side data model. Validates against
 *  https://validator.w3.org/feed/.
 *
 *  Why ship Atom alongside RSS? Some readers (Inoreader categories, Kagi
 *  labels, Reeder 5 smart folders) prefer Atom for richer metadata —
 *  per-item `updated` dates, structured `author`, etc. RSS items can't
 *  express those cleanly.
 * ==========================================================================*/

export interface AtomEntry {
  /** Stable identifier — usually the canonical URL or a tag: URI. */
  id: string;
  title: string;
  /** Absolute URL the entry points to (rel=alternate). */
  link: string;
  /** Short HTML or plaintext summary. */
  summary: string;
  /** Optional full HTML content. Will be wrapped with `type="html"`. */
  contentHtml?: string;
  /** ISO-8601 timestamp; RFC 3339 compatible. */
  published: string;
  updated?: string;
  /** Optional author name. */
  author?: string;
  /** Optional category labels. */
  categories?: string[];
}

export interface AtomMeta {
  /** Feed-level title. */
  title: string;
  /** Self-link (absolute URL to the feed endpoint). */
  feedUrl: string;
  /** Site link (absolute URL to the human-readable index). */
  siteUrl: string;
  /** Feed-level id; usually the site URL or a tag: URI. */
  id?: string;
  /** Optional subtitle/description. */
  subtitle?: string;
  /** ISO-8601 timestamp — defaults to now. */
  updated?: string;
  language?: string;
  /** Optional generator name; defaults to "DocketLens (in-house)". */
  generator?: string;
}

export function renderAtom(meta: AtomMeta, entries: AtomEntry[]): string {
  const lang = meta.language ?? "en-US";
  const updated = meta.updated ?? new Date().toISOString();
  const id = meta.id ?? meta.siteUrl;
  const generator = meta.generator ?? "DocketLens (in-house)";

  const entriesXml = entries
    .map((e) => {
      const cats = (e.categories ?? [])
        .map((c) => `    <category term="${esc(c)}" />`)
        .join("\n");
      const author = e.author
        ? `    <author><name>${esc(e.author)}</name></author>\n`
        : "";
      const content = e.contentHtml
        ? `    <content type="html"><![CDATA[${e.contentHtml}]]></content>\n`
        : "";
      const upd = e.updated ?? e.published;
      return `  <entry>
    <id>${esc(e.id)}</id>
    <title>${esc(e.title)}</title>
    <link rel="alternate" href="${esc(e.link)}" />
    <published>${esc(e.published)}</published>
    <updated>${esc(upd)}</updated>
${author}    <summary><![CDATA[${e.summary}]]></summary>
${content}${cats ? cats + "\n" : ""}  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${esc(lang)}">
  <title>${esc(meta.title)}</title>
  <link rel="self" href="${esc(meta.feedUrl)}" type="application/atom+xml" />
  <link rel="alternate" href="${esc(meta.siteUrl)}" type="text/html" />
  <id>${esc(id)}</id>
  <updated>${esc(updated)}</updated>
${meta.subtitle ? `  <subtitle>${esc(meta.subtitle)}</subtitle>\n` : ""}  <generator>${esc(generator)}</generator>
${entriesXml}
</feed>
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
