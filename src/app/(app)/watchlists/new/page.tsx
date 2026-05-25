"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, User, Gavel, Briefcase, BookOpen, Search, Sparkles } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPES = [
  { key: "party", label: "Party", icon: Building2, hint: "Company, individual, government agency" },
  { key: "attorney", label: "Attorney", icon: User, hint: "Lead counsel, partner, AUSA" },
  { key: "judge", label: "Judge", icon: Gavel, hint: "Article III, magistrate, bankruptcy" },
  { key: "lawfirm", label: "Law firm", icon: Briefcase, hint: "Track every case naming the firm" },
  { key: "case", label: "Case", icon: Search, hint: "Specific case number to follow" },
  { key: "term", label: "Term search", icon: BookOpen, hint: "Free-text search across filings" },
] as const;

const COURTS = ["S.D.N.Y.", "N.D. Cal.", "D. Del.", "E.D. Tex.", "D.D.C.", "C.D. Cal.", "N.D. Ill.", "E.D. Va."];
const NOS = [
  { code: "830", label: "Patent" },
  { code: "840", label: "Trade Secret" },
  { code: "850", label: "Securities" },
  { code: "410", label: "Antitrust" },
  { code: "190", label: "Contract" },
  { code: "440", label: "Civil Rights" },
];
const CADENCE = [
  { key: "realtime", label: "Real-time", note: "Pro · seconds" },
  { key: "hourly", label: "Hourly", note: "Pro" },
  { key: "daily", label: "Daily", note: "Free + Pro" },
] as const;

type TypeKey = (typeof TYPES)[number]["key"];

const VALID_TYPES = new Set<TypeKey>([
  "party",
  "attorney",
  "judge",
  "lawfirm",
  "case",
  "term",
]);

function csv(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NewWatchlistPage() {
  // Prefill from a watchlist-template deep-link. Falls back to empty when no
  // query params are present, so the form behaves identically for both the
  // template flow and the "start from scratch" flow.
  const params = useSearchParams();
  const templateId = params.get("template");
  const initialType: TypeKey = (() => {
    const t = params.get("type") as TypeKey | null;
    return t && VALID_TYPES.has(t) ? t : "party";
  })();

  const [type, setType] = useState<TypeKey>(initialType);
  const [name, setName] = useState(params.get("name") ?? "");
  const [match, setMatch] = useState(params.get("match") ?? "");
  const [courts, setCourts] = useState<string[]>(csv(params.get("courts")));
  const [nos, setNos] = useState<string[]>(csv(params.get("nos")));
  const [cadence, setCadence] = useState<(typeof CADENCE)[number]["key"]>("daily");
  const [description, setDescription] = useState("");

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <>
      <Topbar title="New watchlist" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6">
            <Link
              href={"/watchlists" as never}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono"
            >
              <ArrowLeft className="size-3" />
              Back to watchlists
            </Link>
          </div>

          <h1 className="display-2 mb-3">Watch something new.</h1>
          <p className="text-base text-[color:var(--color-fg-muted)] mb-6 max-w-2xl leading-relaxed">
            We&apos;ll resolve aliases automatically. Apple Inc. matches Apple, Inc., APPLE INC., and Apple Computer Inc. Filters tighten the matches you&apos;re alerted on.
          </p>

          {templateId && (
            <div className="mb-10 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/30 px-3 py-1.5 text-xs">
              <Sparkles className="size-3 text-[color:var(--color-accent)]" />
              <span className="text-[color:var(--color-fg)]">
                Pre-filled from template{" "}
                <code className="font-mono">{templateId}</code>
              </span>
              <Link
                href={"/watchlists?empty=1" as never}
                className="ml-2 text-[color:var(--color-fg-muted)] underline underline-offset-2 hover:text-[color:var(--color-fg)]"
              >
                pick different
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-10">
            <section>
              <h2 className="eyebrow mb-3">Step 1 — What are we watching?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TYPES.map((t) => {
                  const active = type === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className={cn(
                        "text-left rounded-[var(--radius-md)] border p-4 transition-colors",
                        active
                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]/40"
                          : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]"
                      )}
                    >
                      <t.icon
                        className={cn(
                          "size-5 mb-2",
                          active
                            ? "text-[color:var(--color-accent)]"
                            : "text-[color:var(--color-fg-muted)]"
                        )}
                      />
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5 leading-relaxed">
                        {t.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="eyebrow mb-3">Step 2 — Name + value</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
                    Watchlist name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apple Inc. patent suits"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
                    {type === "case"
                      ? "Case number"
                      : type === "term"
                      ? "Search term"
                      : type === "judge"
                      ? "Judge name"
                      : type === "lawfirm"
                      ? "Firm name"
                      : type === "attorney"
                      ? "Attorney name"
                      : "Party name"}
                  </label>
                  <Input
                    value={match}
                    onChange={(e) => setMatch(e.target.value)}
                    placeholder={
                      type === "case"
                        ? "1:25-cv-04812"
                        : type === "judge"
                        ? "Aileen Cannon"
                        : "Apple Inc."
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
                  Description (optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why are we watching this? Helpful for teammates."
                />
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="eyebrow">Step 3 — Filters</h2>
                <p className="text-xs text-[color:var(--color-fg-subtle)] font-mono">
                  optional · narrow your matches
                </p>
              </div>

              <Card className="p-5 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-medium text-[color:var(--color-fg-muted)] block mb-2">
                    Courts
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COURTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCourts((s) => toggle(s, c))}
                        className={cn(
                          "text-xs font-mono rounded-full px-2.5 py-1 border transition-colors",
                          courts.includes(c)
                            ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] border-transparent"
                            : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[color:var(--color-fg-muted)] block mb-2">
                    Nature of suit
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {NOS.map((n) => (
                      <button
                        key={n.code + n.label}
                        type="button"
                        onClick={() => setNos((s) => toggle(s, n.code))}
                        className={cn(
                          "text-xs rounded-full px-2.5 py-1 border transition-colors",
                          nos.includes(n.code)
                            ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border-transparent"
                            : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                        )}
                      >
                        <span className="font-mono mr-1">{n.code}</span>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            <section>
              <h2 className="eyebrow mb-3">Step 4 — Alert cadence</h2>
              <div className="grid grid-cols-3 gap-3">
                {CADENCE.map((c) => {
                  const active = cadence === c.key;
                  const pro = c.key !== "daily";
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCadence(c.key)}
                      className={cn(
                        "text-left rounded-[var(--radius-md)] border p-4 transition-colors relative",
                        active
                          ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]/40"
                          : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]"
                      )}
                    >
                      {pro && (
                        <Badge variant="accent" className="absolute top-3 right-3">
                          PRO
                        </Badge>
                      )}
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
                        {c.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex justify-end gap-2 pt-2 border-t border-[color:var(--color-border)]">
              <Button asChild variant="outline">
                <Link href={"/watchlists" as never}>Cancel</Link>
              </Button>
              <Button variant="accent" disabled={!name || !match}>
                Create watchlist
              </Button>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
