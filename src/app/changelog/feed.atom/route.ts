import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderAtom } from "@/lib/atom";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  Changelog Atom 1.0 — sibling of /changelog/feed.xml.
 *
 *  Parses docs/CHANGELOG.md and emits one <entry> per release. The XML
 *  parser is duplicated rather than abstracted because /feed.xml and
 *  /feed.atom are the only call sites and the regex is short.
 * ==========================================================================*/

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  body: string;
}

function parseChangelog(src: string): ChangelogEntry[] {
  const headingRe = /^##\s+(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})[^\n]*$/gm;
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
  const out: ChangelogEntry[] = [];
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const nextIdx = i + 1 < headings.length ? headings[i + 1].idx : src.length;
    out.push({
      version: h.version,
      date: h.date,
      title: h.title,
      body: src.slice(h.endIdx, nextIdx).trim(),
    });
  }
  return out;
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

  const xml = renderAtom(
    {
      title: "DocketLens — changelog",
      feedUrl: `${SITE}/changelog/feed.atom`,
      siteUrl: `${SITE}/changelog`,
      id: `${SITE}/changelog`,
      subtitle:
        "Every shipped change to DocketLens, by release. We track changes by ISO date in UTC.",
      language: "en-US",
    },
    entries.map((e) => ({
      id: `${SITE}/changelog#${e.version}`,
      title: `${e.version} — ${e.date}`,
      link: `${SITE}/changelog#${e.version}`,
      published: `${e.date}T12:00:00Z`,
      summary: e.title,
      contentHtml: `<pre>${escapeHtml(e.body)}</pre>`,
    }))
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
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
