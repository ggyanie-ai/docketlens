/* ============================================================================
 *  JSON Feed 1.1 emitter
 *
 *  Spec: https://jsonfeed.org/version/1.1
 *
 *  Why JSON Feed alongside RSS + Atom? Modern readers (Reeder 5,
 *  NetNewsWire 6+, Inoreader) support it natively. It sidesteps XML
 *  escaping bugs entirely — `JSON.stringify` is the producer-side discipline.
 *
 *  Returned as a plain object; the route serializes via `JSON.stringify`.
 * ==========================================================================*/

export interface JsonFeedItem {
  /** Unique, never-changing identifier. URL or tag URI. */
  id: string;
  url?: string;
  title?: string;
  /** Plaintext summary. */
  content_text?: string;
  /** HTML body. */
  content_html?: string;
  summary?: string;
  /** RFC 3339 timestamp. */
  date_published?: string;
  date_modified?: string;
  authors?: { name: string; url?: string }[];
  tags?: string[];
  language?: string;
}

export interface JsonFeed {
  version: "https://jsonfeed.org/version/1.1";
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  language?: string;
  authors?: { name: string; url?: string }[];
  items: JsonFeedItem[];
}

export interface JsonFeedMeta {
  title: string;
  homepage: string;
  feedUrl: string;
  description?: string;
  language?: string;
  author?: { name: string; url?: string };
}

export function renderJsonFeed(
  meta: JsonFeedMeta,
  items: JsonFeedItem[]
): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: meta.title,
    home_page_url: meta.homepage,
    feed_url: meta.feedUrl,
    description: meta.description,
    language: meta.language ?? "en-US",
    authors: meta.author ? [meta.author] : undefined,
    items,
  };
}
