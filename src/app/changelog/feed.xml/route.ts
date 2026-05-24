import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderRss, rfc822 } from "@/lib/rss";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  Changelog RSS — parses docs/CHANGELOG.md and emits one <item> per release.
 *
 *  Heading shape (matches what CHANGELOG.md uses):
 *    ## 0.1.1 — 2026-05-23 (polish pass)
 *
 *  We split the file on `^## ` lines, grab the version + date from the
 *  heading, treat the body up to the next `## ` as the description.
 * ==========================================================================*/

interface ChangelogEntry {
  version: string;
  date: string; // ISO YYYY-MM-DD
  title: string; // full heading text after `## `
  body: string;
}

function parseChangelog(src: string): ChangelogEntry[] {
  // Match: ## 0.1.1 — 2026-05-23 (label)
  // Em-dash, en-dash, or hyphen all accepted between version and date.
  const headingRe = /^##\s+(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})[^\n]*$/gm;
  const entries: ChangelogEntry[] = [];
  const headings: { version: string; date: string; title: string; idx: number; endIdx: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(src)) !== null) {
    headings.push({
      version: m[1],
      date: m[2],
      title: m[0].replace(/^##\s+/, ""),
      idx: m.index,
      endIdx: m.index + m[0].length,
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const nextIdx = i + 1 < headings.length ? headings[i + 1].idx : src.length;
    const body = src.slice(h.endIdx, nextIdx).trim();
    entries.push({
      version: h.version,
      date: h.date,
      title: h.title,
      body,
    });
  }

  return entries;
}

export async function GET() {
  let raw = "";
  try {
    raw = await readFile(
      path.join(process.cwd(), "docs", "CHANGELOG.md"),
      "utf8"
    );
  } catch {
    raw = "";
  }
  const entries = parseChangelog(raw);

  const xml = renderRss(
    {
      title: "DocketLens — changelog",
      feedUrl: `${SITE}/changelog/feed.xml`,
      siteUrl: `${SITE}/changelog`,
      description:
        "Every shipped change to DocketLens, by release. We track changes by ISO date in UTC.",
      language: "en-US",
    },
    entries.map((e) => ({
      guid: `${SITE}/changelog#${e.version}`,
      title: `${e.version} — ${e.date}`,
      link: `${SITE}/changelog#${e.version}`,
      // Anchor links use `#0.1.1`, which our /changelog Markdown renderer
      // doesn't generate ids for — link to the page and the version is in
      // the rendered heading. RSS readers will follow it anyway.
      pubDate: rfc822(e.date + "T12:00:00Z"),
      description: e.title,
      contentHtml: `<pre>${escapeHtml(e.body)}</pre>`,
    }))
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
