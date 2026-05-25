"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search as SearchIcon,
  ArrowRight,
  Keyboard,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

/* ============================================================================
 *  /lookup — single-input docket-number quick redirect
 *
 *  The URL-bar shortcut. Drop a docket number into the box, hit Enter, and:
 *   • Exact-match a cached SAMPLE_DOCKETS case → /dockets/[id]
 *   • Otherwise → /search?q=<num>
 *
 *  `/lookup?q=<num>` resolves immediately on mount, so this also works as a
 *  bookmarklet-style URL: `https://docketlens.ai/lookup?q=1:25-cv-04812`.
 * ==========================================================================*/

// e.g. 1:25-cv-04812, 2:25-md-00382, 24-1234 (appeals).
// Lenient — we accept anything that vaguely looks like a docket number and
// let the search page do the heavier work.
const DOCKET_NUMBER_RE = /^\s*[0-9A-Za-z][\d:-]+[\dA-Za-z]\s*$/;

function normalize(raw: string): string {
  return raw.trim();
}

function findInCache(num: string) {
  const n = num.toLowerCase();
  return SAMPLE_DOCKETS.find(
    (d) => d.caseNumber.toLowerCase() === n
  );
}

export default function LookupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [resolving, setResolving] = useState(false);

  // Handle `?q=` on mount — auto-redirect for bookmarklet usage.
  useEffect(() => {
    const initial = searchParams.get("q");
    if (initial) {
      setQ(initial);
      void resolve(initial);
    }
    // We deliberately do NOT depend on `resolve`; this only fires on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolve(raw: string) {
    const num = normalize(raw);
    if (!num) return;

    if (!DOCKET_NUMBER_RE.test(num)) {
      toast.error("Doesn't look like a docket number", {
        description: "Expected something like 1:25-cv-04812 or 24-1234.",
      });
      return;
    }

    setResolving(true);

    const hit = findInCache(num);
    if (hit) {
      toast.success("Found in cache", {
        description: `Opening ${hit.caseNameShort ?? hit.caseName}…`,
      });
      router.push(`/dockets/${hit.id}` as never);
      return;
    }

    // Fall through to general search.
    toast("Not in cache — opening search", {
      description: `Searching across cached dockets for "${num}".`,
    });
    router.push(`/search?q=${encodeURIComponent(num)}` as never);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void resolve(q);
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-[420px] w-[1000px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-3xl px-6 pt-16 md:pt-24 pb-12 text-center">
            <Badge variant="accent" className="mb-4">
              <Keyboard className="size-3" />
              URL-bar power tool
            </Badge>
            <h1 className="display-1">
              Paste a docket number,{" "}
              <span className="italic text-[color:var(--color-accent)]">
                we&apos;ll take it from there.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl mx-auto">
              Bookmark this page or wire it into your launcher. Hit Enter and
              you&apos;re on the case — straight to the cached docket if we
              have it, straight to a pre-filtered search if we don&apos;t.
            </p>

            <form onSubmit={onSubmit} className="mt-10 mx-auto max-w-xl">
              <div className="relative">
                <label htmlFor="lookup-q" className="sr-only">
                  Docket number
                </label>
                <SearchIcon
                  aria-hidden
                  className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)]"
                />
                <Input
                  id="lookup-q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="1:25-cv-04812"
                  autoFocus
                  inputMode="text"
                  spellCheck={false}
                  autoComplete="off"
                  className="pl-12 pr-32 h-14 text-[16px] font-mono"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  disabled={resolving || q.trim().length === 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Go
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
                <Kbd>Enter</Kbd>
                <span>to resolve</span>
                <span className="mx-1.5 text-[color:var(--color-fg-subtle)]">·</span>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                <span>opens the full command palette</span>
              </p>
            </form>
          </div>
        </section>

        {/* Try one */}
        <section className="mx-auto max-w-3xl px-6 pb-12">
          <p className="eyebrow mb-3 text-center">Try one of these</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_DOCKETS.slice(0, 5).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setQ(d.caseNumber);
                  void resolve(d.caseNumber);
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-1.5 text-xs hover:border-[color:var(--color-accent)] transition-colors"
              >
                <span className="font-mono text-[color:var(--color-fg)]">
                  {d.caseNumber}
                </span>
                <span className="text-[color:var(--color-fg-muted)] hidden sm:inline truncate max-w-[180px]">
                  {d.caseNameShort ?? d.caseName}
                </span>
                <ArrowRight className="size-3 text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors" />
              </button>
            ))}
          </div>
        </section>

        {/* What gets accepted */}
        <section className="mx-auto max-w-3xl px-6 pb-12">
          <Card className="p-6">
            <h2 className="font-serif text-lg tracking-tight mb-3">
              What gets accepted
            </h2>
            <ul className="text-sm leading-relaxed text-[color:var(--color-fg-muted)] space-y-2.5">
              <li className="flex gap-3">
                <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] mt-1 shrink-0 w-32">
                  district + civil
                </span>
                <span>
                  <code className="font-mono text-[12.5px]">
                    1:25-cv-04812
                  </code>{" "}
                  — the canonical district-court docket number.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] mt-1 shrink-0 w-32">
                  district + MDL
                </span>
                <span>
                  <code className="font-mono text-[12.5px]">
                    2:25-md-00382
                  </code>{" "}
                  — multidistrict litigation works the same.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] mt-1 shrink-0 w-32">
                  appeals
                </span>
                <span>
                  <code className="font-mono text-[12.5px]">24-1234</code>{" "}
                  — circuit-court docket numbers don&apos;t carry the
                  judge/division prefix.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] mt-1 shrink-0 w-32">
                  free text
                </span>
                <span>
                  Anything that doesn&apos;t parse as a docket number gets
                  routed to <Link href={"/search" as never} className="underline underline-offset-2 text-[color:var(--color-fg)]">/search</Link>{" "}
                  with your query pre-filled.
                </span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Tips */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-6 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Sparkles className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              <p className="font-medium text-[color:var(--color-fg)]">
                Power-user tip
              </p>
              <p className="mt-2">
                The URL{" "}
                <code className="font-mono text-[12.5px]">
                  /lookup?q=&lt;num&gt;
                </code>{" "}
                resolves immediately. Add it as a browser keyword search
                shortcut and you can jump from your address bar:
              </p>
              <pre className="mt-3 font-mono text-[12.5px] text-[color:var(--color-fg)] bg-[color:var(--color-bg)] border border-[color:var(--color-border)] rounded-[var(--radius-md)] p-3 overflow-x-auto">
                {`dl 1:25-cv-04812
↓ resolves to ↓
docketlens.ai/lookup?q=1:25-cv-04812
↓ redirects to ↓
docketlens.ai/dockets/dkt_helios_v_northgate`}
              </pre>
              <p className="mt-3 text-xs text-[color:var(--color-fg-muted)]">
                Browser-shortcut setup:{" "}
                <a
                  href="https://support.google.com/chrome/answer/95426"
                  target="_blank"
                  rel="noopener"
                  className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] inline-flex items-center gap-1"
                >
                  Chrome
                  <ExternalLink className="size-3" />
                </a>
                {" · "}
                <a
                  href="https://support.mozilla.org/en-US/kb/use-keyboard-shortcuts-perform-firefox-tasks-quickly"
                  target="_blank"
                  rel="noopener"
                  className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] inline-flex items-center gap-1"
                >
                  Firefox
                  <ExternalLink className="size-3" />
                </a>
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
