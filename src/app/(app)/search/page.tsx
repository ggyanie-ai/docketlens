"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, Filter, BookmarkPlus, ArrowUpRight } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import { timeAgo } from "@/lib/utils";

const COURTS = [
  "S.D.N.Y.", "N.D. Cal.", "D. Del.", "E.D. Tex.", "D.D.C.", "C.D. Cal.", "N.D. Ill.",
];
const NOS = [
  { code: "830", label: "Patent" },
  { code: "840", label: "Trade Secret" },
  { code: "850", label: "Securities" },
  { code: "410", label: "Antitrust" },
  { code: "830", label: "Trademark" },
];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [activeCourt, setActiveCourt] = useState<string | null>(null);
  const [activeNos, setActiveNos] = useState<string | null>(null);
  const [scope, setScope] = useState("all");

  const filtered = useMemo(() => {
    return SAMPLE_DOCKETS.filter((d) => {
      if (q) {
        const haystack = `${d.caseName} ${d.caseNumber} ${d.parties
          .map((p) => p.name)
          .join(" ")} ${d.judge}`.toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      if (activeCourt && d.court !== activeCourt) return false;
      if (activeNos && d.natureOfSuitCode !== activeNos) return false;
      if (scope === "patent" && !d.tags.includes("Patent")) return false;
      if (scope === "securities" && !d.tags.includes("Securities")) return false;
      if (scope === "antitrust" && !d.tags.includes("Antitrust")) return false;
      return true;
    });
  }, [q, activeCourt, activeNos, scope]);

  return (
    <>
      <Topbar title="Search" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)]" />
                <Input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by case name, number, party, attorney, or judge…"
                  className="pl-9 h-11 text-[15px]"
                  autoFocus
                />
              </div>
              <Button variant="accent" size="lg">
                Search
              </Button>
              <Button variant="outline" size="lg">
                <BookmarkPlus className="size-4" />
                Save
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <span className="eyebrow">Court</span>
              <div className="flex gap-1.5 flex-wrap">
                {COURTS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setActiveCourt((a) => (a === c ? null : c))}
                    className={`text-xs font-mono rounded-full px-2.5 py-1 border transition-colors ${
                      activeCourt === c
                        ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] border-transparent"
                        : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="eyebrow">Nature of suit</span>
              <div className="flex gap-1.5 flex-wrap">
                {NOS.map((n) => (
                  <button
                    type="button"
                    key={n.code + n.label}
                    onClick={() => setActiveNos((a) => (a === n.code ? null : n.code))}
                    className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                      activeNos === n.code
                        ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border-transparent"
                        : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)]"
                    }`}
                  >
                    <span className="font-mono mr-1">{n.code}</span> {n.label}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">
                <Filter className="size-3.5" /> More filters
              </Button>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Tabs value={scope} onValueChange={setScope}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="patent">Patent</TabsTrigger>
                <TabsTrigger value="securities">Securities</TabsTrigger>
                <TabsTrigger value="antitrust">Antitrust</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs font-mono text-[color:var(--color-fg-subtle)] tabular">
              {filtered.length} results · sorted by date filed
            </p>
          </div>

          {filtered.length === 0 ? (
            <Empty
              icon={SearchIcon}
              title="No matches"
              body="Try a broader query, or clear a filter chip above."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul>
                {filtered.map((d) => (
                  <li
                    key={d.id}
                    className="border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors"
                  >
                    <Link
                      href={`/dockets/${d.id}` as never}
                      className="block px-5 py-5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                          {d.court} · {d.caseNumber}
                        </span>
                        {d.tags.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant={
                              t === "Hot"
                                ? "danger"
                                : t === "Patent"
                                ? "accent"
                                : t === "Securities"
                                ? "warning"
                                : t === "Antitrust"
                                ? "info"
                                : "default"
                            }
                          >
                            {t}
                          </Badge>
                        ))}
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
                          Last filing {timeAgo(d.entries[d.entries.length - 1]?.dateFiled ?? d.filed)}
                          <ArrowUpRight className="size-3" />
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-medium tracking-tight">
                        {d.caseName}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                        {d.natureOfSuit} · {d.judge} ·{" "}
                        <span className="font-mono">{d.entries.length}</span>{" "}
                        docket entries
                      </p>
                      {d.entries[d.entries.length - 1]?.summaryOne && (
                        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                          <span className="text-[color:var(--color-accent)] font-medium">
                            Latest:
                          </span>{" "}
                          {d.entries[d.entries.length - 1].summaryOne}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
