import Link from "next/link";
import type { ReactNode } from "react";

/* ============================================================================
 *  Tiny markdown renderer
 *
 *  Block-level: # h1, ## h2, ### h3, bullet lists (- item), paragraphs.
 *  Inline:      **bold**, `code`, and [text](href) links.
 *
 *  Purpose-built for our internal markdown docs (CHANGELOG.md) — we
 *  intentionally avoid pulling in `remark`/`unified` for the few features we
 *  use. If we ever want footnotes, tables, GFM task lists, etc., swap this for
 *  `react-markdown`.
 * ==========================================================================*/

type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

type Block =
  | { type: "h1"; spans: Inline[] }
  | { type: "h2"; spans: Inline[] }
  | { type: "h3"; spans: Inline[] }
  | { type: "p"; spans: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "blockquote"; spans: Inline[] }
  | { type: "hr" };

/* ----------------------------- Inline parser ----------------------------- */

const INLINE_RE = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let cursor = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > cursor) out.push({ type: "text", text: text.slice(cursor, idx) });
    if (m[1] && m[2]) out.push({ type: "link", text: m[1], href: m[2] });
    else if (m[3]) out.push({ type: "code", text: m[3] });
    else if (m[4]) out.push({ type: "strong", text: m[4] });
    else if (m[5]) out.push({ type: "em", text: m[5] });
    cursor = idx + m[0].length;
  }
  if (cursor < text.length) out.push({ type: "text", text: text.slice(cursor) });
  return out;
}

/* ----------------------------- Block parser ----------------------------- */

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+?)\s*$/);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      const type = (level === 1 ? "h1" : level === 2 ? "h2" : "h3") as Block["type"];
      blocks.push({ type, spans: parseInline(h[2]) } as Block);
      i++;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s+/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", spans: parseInline(buf.join(" ")) });
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        const head = lines[i].replace(/^[-*+]\s+/, "");
        const lineBuf = [head];
        i++;
        // Continuation lines (indented by 2+ spaces)
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          lineBuf.push(lines[i].trim());
          i++;
        }
        items.push(parseInline(lineBuf.join(" ")));
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Paragraph — accumulate until blank line / new block
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s+|[-*+]\s+|>\s+|---+\s*$)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", spans: parseInline(para.join(" ")) });
  }

  return blocks;
}

/* ----------------------------- Renderer ----------------------------- */

function renderInline(spans: Inline[]): ReactNode {
  return spans.map((s, i) => {
    switch (s.type) {
      case "text":
        return <span key={i}>{s.text}</span>;
      case "strong":
        return (
          <strong key={i} className="text-[color:var(--color-fg)] font-medium">
            {s.text}
          </strong>
        );
      case "em":
        return (
          <em key={i} className="italic">
            {s.text}
          </em>
        );
      case "code":
        return (
          <code
            key={i}
            className="font-mono text-[0.875em] rounded px-1 py-0.5 border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]"
          >
            {s.text}
          </code>
        );
      case "link": {
        const external = /^https?:\/\//.test(s.href);
        return external ? (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
          >
            {s.text}
          </a>
        ) : (
          <Link
            key={i}
            href={s.href as never}
            className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
          >
            {s.text}
          </Link>
        );
      }
    }
  });
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h1":
            return (
              <h1
                key={i}
                className="font-serif text-3xl md:text-4xl tracking-tight text-[color:var(--color-fg)] mt-0 mb-4"
              >
                {renderInline(b.spans)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={i}
                className="font-serif text-2xl md:text-3xl tracking-tight text-[color:var(--color-fg)] mt-14 mb-3"
              >
                {renderInline(b.spans)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="font-medium text-base tracking-tight text-[color:var(--color-fg)] mt-8 mb-2 eyebrow"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {renderInline(b.spans)}
              </h3>
            );
          case "p":
            return (
              <p
                key={i}
                className="my-4 text-[15.5px] leading-[1.75] text-[color:var(--color-fg-muted)]"
              >
                {renderInline(b.spans)}
              </p>
            );
          case "blockquote":
            return (
              <blockquote
                key={i}
                className="my-6 border-l-2 border-[color:var(--color-accent)] pl-5 italic text-[color:var(--color-fg)]"
              >
                {renderInline(b.spans)}
              </blockquote>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="my-4 ml-5 list-disc space-y-2 text-[15.5px] leading-[1.65] text-[color:var(--color-fg-muted)] marker:text-[color:var(--color-fg-subtle)]"
              >
                {b.items.map((spans, j) => (
                  <li key={j} className="pl-1">
                    {renderInline(spans)}
                  </li>
                ))}
              </ul>
            );
          case "hr":
            return (
              <hr
                key={i}
                className="my-10 border-t border-[color:var(--color-border)]"
              />
            );
        }
      })}
    </>
  );
}
