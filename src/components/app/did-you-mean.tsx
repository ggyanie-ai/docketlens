"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/* ============================================================================
 *  DidYouMean
 *
 *  Client island for /404. Reads `window.location.pathname` and fuzzy-ranks
 *  it against a curated list of public routes. Surfaces the three closest
 *  matches as quick-jump links — most 404s are typos or stale bookmarks.
 *
 *  Why a curated list rather than reading sitemap.xml at runtime: the
 *  sitemap is huge (per-blog, per-doc, per-docket entries), and 404 traffic
 *  doesn't justify the round-trip. We only want to suggest the obvious
 *  marketing surfaces.
 * ==========================================================================*/

const SUGGEST_POOL: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/pricing", label: "Pricing" },
  { path: "/demo", label: "Demo cases" },
  { path: "/blog", label: "Blog" },
  { path: "/docs", label: "Documentation" },
  { path: "/docs/api-reference", label: "API reference" },
  { path: "/changelog", label: "Changelog" },
  { path: "/feeds", label: "Feeds hub" },
  { path: "/jurisdictions", label: "Jurisdictions" },
  { path: "/glossary", label: "Glossary" },
  { path: "/comparison", label: "Comparison" },
  { path: "/vs/pacer", label: "vs. PACER" },
  { path: "/vs/lex-machina", label: "vs. Lex Machina" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/press", label: "Press kit" },
  { path: "/lookup", label: "Docket lookup" },
  { path: "/status", label: "Status" },
  { path: "/security", label: "Security" },
  { path: "/donate", label: "Donate to Free Law Project" },
  { path: "/widget", label: "Embeddable widgets" },
  { path: "/tools/verify-webhook", label: "Verify webhook signature" },
  { path: "/legal/privacy", label: "Privacy" },
  { path: "/legal/terms", label: "Terms" },
  { path: "/legal/data-sources", label: "Data sources" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/watchlists", label: "Watchlists" },
  { path: "/alerts", label: "Alerts" },
  { path: "/settings", label: "Settings" },
  { path: "/api-keys", label: "API keys" },
];

/**
 * Damerau-Levenshtein distance, capped at the longer string's length. Cheap
 * enough for ~30-entry pools; we don't bother with prefix/n-gram tricks.
 */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

interface Suggestion {
  path: string;
  label: string;
  d: number;
}

export function DidYouMean() {
  const [requested, setRequested] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRequested(window.location.pathname);
  }, []);

  if (!requested) return null;

  const norm = requested.toLowerCase().replace(/\/+$/, "") || "/";
  // Skip suggestions when the path is literally / — that's not a typo.
  if (norm === "/") return null;

  // Score each candidate by min(distance to whole-path, distance to
  // last-segment). The last-segment branch catches cases like
  // "/blogs/foo" → "/blog" where the typo is the directory.
  const lastSeg = norm.split("/").filter(Boolean).pop() ?? "";

  const ranked: Suggestion[] = SUGGEST_POOL.map((p) => {
    const candLast = p.path.split("/").filter(Boolean).pop() ?? "";
    const dWhole = distance(norm, p.path);
    const dLast = distance(lastSeg, candLast);
    return { path: p.path, label: p.label, d: Math.min(dWhole, dLast) };
  }).sort((a, b) => a.d - b.d);

  // Cut off — anything more than 5 edits from the closest match is just
  // a different page; show the universal fallback instead.
  const best = ranked[0]?.d ?? 999;
  if (best > 5) return null;

  const top = ranked.slice(0, 3);

  return (
    <div className="mt-12 mx-auto max-w-md text-left">
      <p className="eyebrow mb-3">Did you mean?</p>
      <ul className="flex flex-col gap-1">
        {top.map((s) => (
          <li key={s.path}>
            <Link
              href={s.path as never}
              className="group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium truncate">
                  {s.label}
                </span>
                <span className="block font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] truncate">
                  {s.path}
                </span>
              </span>
              <ArrowUpRight className="size-3 text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] transition-colors shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        You asked for{" "}
        <code className="text-[color:var(--color-fg-muted)] normal-case">
          {requested}
        </code>
      </p>
    </div>
  );
}
