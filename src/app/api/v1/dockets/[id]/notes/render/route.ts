import { type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { docketNotes } from "@/lib/db/schema";
import { parseMarkdown } from "@/lib/markdown";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, preflight } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/dockets/{id}/notes/render
 *
 *  Server-renders the calling org's docket note to HTML using the
 *  existing parseMarkdown() block parser plus a small HTML serializer
 *  inline. We deliberately don't use react-dom/server because Next.js
 *  blocks it in route handlers — the markdown subset we support is
 *  small enough that walking the AST is the right shape anyway.
 *
 *  Content-type is text/html. Empty 200 body when no note exists
 *  (same shape contract as the JSON variant). Auth required; no plan
 *  gate (read-only is free for everyone). Per-org private — never
 *  returns another org's note.
 * ==========================================================================*/

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type InlineSpan = ReturnType<typeof parseMarkdown>[number] extends {
  spans?: infer S;
}
  ? S
  : never;

function renderInline(spans: InlineSpan): string {
  if (!Array.isArray(spans)) return "";
  return (spans as Array<Record<string, unknown>>)
    .map((s) => {
      switch (s.type) {
        case "text":
          return escapeHtml(String(s.text ?? ""));
        case "strong":
          return `<strong>${escapeHtml(String(s.text ?? ""))}</strong>`;
        case "em":
          return `<em>${escapeHtml(String(s.text ?? ""))}</em>`;
        case "code":
          return `<code>${escapeHtml(String(s.text ?? ""))}</code>`;
        case "link": {
          const href = String(s.href ?? "");
          // Only allow http(s) and root-relative — strip javascript: etc.
          const safe =
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("/")
              ? href
              : "#";
          const ext = safe.startsWith("http");
          return `<a href="${escapeHtml(safe)}"${
            ext ? ' target="_blank" rel="noopener"' : ""
          }>${escapeHtml(String(s.text ?? ""))}</a>`;
        }
        default:
          return "";
      }
    })
    .join("");
}

/**
 * Walk the block AST emitted by parseMarkdown() and produce a small
 * HTML document body. Conservative subset: headings, paragraphs,
 * lists, blockquotes, hr. Escapes everything that isn't a known span
 * type.
 */
function mdToHtml(src: string): string {
  const blocks = parseMarkdown(src);
  const parts: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "h1":
        parts.push(`<h1>${renderInline(b.spans as InlineSpan)}</h1>`);
        break;
      case "h2":
        parts.push(`<h2>${renderInline(b.spans as InlineSpan)}</h2>`);
        break;
      case "h3":
        parts.push(`<h3>${renderInline(b.spans as InlineSpan)}</h3>`);
        break;
      case "p":
        parts.push(`<p>${renderInline(b.spans as InlineSpan)}</p>`);
        break;
      case "blockquote":
        parts.push(`<blockquote>${renderInline(b.spans as InlineSpan)}</blockquote>`);
        break;
      case "hr":
        parts.push(`<hr />`);
        break;
      case "ul": {
        const items = (b.items ?? [])
          .map((spans) => `<li>${renderInline(spans as InlineSpan)}</li>`)
          .join("");
        parts.push(`<ul>${items}</ul>`);
        break;
      }
    }
  }
  return parts.join("\n");
}

export async function OPTIONS() {
  return preflight();
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const { id } = await ctx.params;

  const row = (
    await db
      .select()
      .from(docketNotes)
      .where(
        and(eq(docketNotes.orgId, auth.orgId), eq(docketNotes.docketId, id))
      )
      .limit(1)
  )[0];

  const body = row?.body ?? "";
  const html = body ? mdToHtml(body) : "";

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, max-age=30",
      "access-control-allow-origin": "*",
      "x-content-type-options": "nosniff",
    },
  });
}
