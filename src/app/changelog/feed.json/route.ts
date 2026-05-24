import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderJsonFeed } from "@/lib/jsonfeed";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

/* ============================================================================
 *  Changelog JSON Feed 1.1 — sibling of /changelog/feed.xml.
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

  const feed = renderJsonFeed(
    {
      title: "DocketLens — changelog",
      homepage: `${SITE}/changelog`,
      feedUrl: `${SITE}/changelog/feed.json`,
      description:
        "Every shipped change to DocketLens, by release. We track changes by ISO date in UTC.",
      language: "en-US",
      author: { name: "DocketLens", url: SITE },
    },
    entries.map((e) => ({
      id: `${SITE}/changelog#${e.version}`,
      url: `${SITE}/changelog#${e.version}`,
      title: `${e.version} — ${e.date}`,
      summary: e.title,
      content_text: e.body,
      date_published: `${e.date}T12:00:00.000Z`,
    }))
  );

  return new Response(JSON.stringify(feed), {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
