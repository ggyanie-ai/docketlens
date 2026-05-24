"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bookmark,
  Bell,
  KeyRound,
  PlayCircle,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  OnboardingChecklist
 *
 *  Renders a small "next steps" checklist on the dashboard. Persistence:
 *  - dl-onboarding-dismissed  (boolean) — user closed the whole strip
 *  - dl-onboarding-steps      (string[]) — slugs of completed steps
 *
 *  Two rendering modes via `variant` prop:
 *  - "hero"   → big card filling the empty dashboard (used when ?empty=1)
 *  - "inline" → compact strip above the KPI grid; dismissable
 * ==========================================================================*/

const DISMISS_KEY = "dl-onboarding-dismissed";
const STEPS_KEY = "dl-onboarding-steps";

interface Step {
  slug: string;
  title: string;
  body: string;
  icon: typeof Bookmark;
  href: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    slug: "watchlist",
    title: "Create your first watchlist",
    body: "Pick a party, judge, or law firm. We resolve aliases so Apple Inc. matches APPLE INC. and Apple Computer.",
    icon: Bookmark,
    href: "/watchlists/new",
    cta: "New watchlist",
  },
  {
    slug: "channel",
    title: "Add a delivery channel",
    body: "Email is the safe default — under thirty seconds. Slack and webhook are one upgrade away.",
    icon: Bell,
    href: "/alerts",
    cta: "Set up alerts",
  },
  {
    slug: "key",
    title: "Generate an API key (optional)",
    body: "Team-only. For wiring matches into Slack workers, internal dashboards, or your case-management system.",
    icon: KeyRound,
    href: "/api-keys",
    cta: "API keys",
  },
  {
    slug: "tour",
    title: "Take the 90-second tour",
    body: "Click through the demo cases to see what an alert + AI summary actually looks like on a real docket.",
    icon: PlayCircle,
    href: "/demo",
    cta: "Open tour",
  },
];

function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STEPS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}
function persistDone(set: Set<string>) {
  try {
    window.localStorage.setItem(STEPS_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}
function loadDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function OnboardingChecklist({
  variant = "inline",
}: {
  variant?: "hero" | "inline";
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDone(loadDone());
    setDismissed(loadDismissed());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  if (variant === "inline" && (dismissed || done.size === STEPS.length))
    return null;

  function toggle(slug: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      persistDone(next);
      if (next.size === STEPS.length && variant === "inline") {
        toast.success("Onboarding complete", {
          description: "Nice — your dashboard's all yours from here.",
        });
      }
      return next;
    });
  }

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  function reopen() {
    setDismissed(false);
    try {
      window.localStorage.removeItem(DISMISS_KEY);
    } catch {
      // ignore
    }
  }

  const completeCount = done.size;
  const pct = Math.round((completeCount / STEPS.length) * 100);

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        variant === "hero"
          ? "p-8 md:p-10 bg-gradient-to-br from-[color:var(--color-accent-soft)]/40 to-transparent"
          : "p-5 bg-gradient-to-br from-[color:var(--color-accent-soft)]/25 to-transparent"
      )}
    >
      {variant === "inline" && (
        <button
          type="button"
          aria-label="Dismiss onboarding checklist"
          onClick={dismiss}
          className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft shrink-0",
            variant === "hero" ? "size-12" : "size-9"
          )}
        >
          <Sparkles className={variant === "hero" ? "size-5" : "size-4"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="eyebrow">Getting started</p>
            <Badge variant="outline" className="text-[10px]">
              {completeCount}/{STEPS.length}
            </Badge>
          </div>
          <h2
            className={cn(
              "font-serif tracking-tight mt-1",
              variant === "hero"
                ? "text-3xl md:text-4xl"
                : "text-xl"
            )}
          >
            {completeCount === STEPS.length ? (
              <>You&apos;re all set up.</>
            ) : (
              <>
                Four quick wins{" "}
                <span className="italic text-[color:var(--color-fg-muted)]">
                  before your first alert lands.
                </span>
              </>
            )}
          </h2>
          {variant === "hero" && (
            <p className="mt-3 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Your dashboard is empty right now because we haven&apos;t got
              a watchlist to populate it with. Knock out these steps and
              come back — your filings, your AI summaries, and your KPI
              tiles will all populate themselves.
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-[color:var(--color-bg-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[color:var(--color-accent)] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <ol
        className={cn(
          "mt-6 grid gap-3",
          variant === "hero" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {STEPS.map((s) => {
          const isDone = done.has(s.slug);
          return (
            <li key={s.slug}>
              <div
                className={cn(
                  "group relative rounded-[var(--radius-md)] border p-4 transition-colors h-full flex flex-col gap-3",
                  isDone
                    ? "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/8"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-[var(--radius-md)] border",
                      isDone
                        ? "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] border-[color:var(--color-success)]/30"
                        : "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]"
                    )}
                  >
                    {isDone ? <Check className="size-4" /> : <s.icon className="size-4" />}
                  </div>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark "${s.title}" ${isDone ? "incomplete" : "complete"}`}
                    onClick={() => toggle(s.slug)}
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded-full border transition-colors",
                      isDone
                        ? "bg-[color:var(--color-success)] border-transparent text-[color:var(--color-bg)]"
                        : "border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)]"
                    )}
                  >
                    {isDone && <Check className="size-3" />}
                  </button>
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isDone &&
                        "text-[color:var(--color-fg-muted)] line-through decoration-[color:var(--color-success)]/40"
                    )}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                    {s.body}
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="self-start -ml-2 mt-auto"
                  onClick={() => toggle(s.slug)}
                >
                  <Link href={s.href as never}>
                    {s.cta}
                    <ChevronRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      {dismissed && variant === "inline" && (
        <button
          type="button"
          onClick={reopen}
          className="absolute bottom-2 right-3 text-[10.5px] font-mono text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          reopen
        </button>
      )}
    </Card>
  );
}
