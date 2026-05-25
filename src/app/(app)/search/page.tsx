"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, Filter, BookmarkPlus, Download } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { CaseResultRow } from "@/components/app/case-result-row";
import { SavedSearchesPanel } from "@/components/app/saved-searches-panel";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import {
  loadSavedSearches,
  persistSavedSearches,
  newSavedSearch,
  type SavedSearch,
} from "@/lib/saved-searches";
import { downloadCsv } from "@/lib/csv";

const COURTS = [
  "S.D.N.Y.", "N.D. Cal.", "D. Del.", "E.D. Tex.", "D.D.C.", "C.D. Cal.", "N.D. Ill.",
];

/* CourtListener slug → our short display name. Only the courts that appear
 * in COURTS above are pre-fillable today; other slugs are accepted as-is so
 * the URL param round-trips even when no chip lights up. */
const SLUG_TO_SHORT: Record<string, string> = {
  nysd: "S.D.N.Y.",
  cand: "N.D. Cal.",
  ded: "D. Del.",
  txed: "E.D. Tex.",
  dcd: "D.D.C.",
  cacd: "C.D. Cal.",
  ilnd: "N.D. Ill.",
};
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

  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(loadSavedSearches());
  }, []);

  // Honor `/search?court=<slug>` deep-links from /jurisdictions.
  const searchParams = useSearchParams();
  useEffect(() => {
    const courtParam = searchParams.get("court");
    if (courtParam) {
      const short = SLUG_TO_SHORT[courtParam] ?? courtParam;
      setActiveCourt(short);
    }
    const qParam = searchParams.get("q");
    if (qParam) setQ(qParam);
  }, [searchParams]);

  const currentQuery = useMemo(
    () => ({ q, court: activeCourt, nos: activeNos, scope }),
    [q, activeCourt, activeNos, scope]
  );

  function handleSave(name: string) {
    const entry = newSavedSearch(currentQuery, name);
    setSaved((prev) => {
      const next = [entry, ...prev];
      persistSavedSearches(next);
      return next;
    });
    setSaving(false);
  }
  function handleDelete(id: string) {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSavedSearches(next);
      return next;
    });
  }
  function handleLoad(s: SavedSearch) {
    setQ(s.query.q);
    setActiveCourt(s.query.court);
    setActiveNos(s.query.nos);
    setScope(s.query.scope);
    setSaving(false);
  }

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
                <label htmlFor="search-q" className="sr-only">
                  Search dockets by case name, number, party, attorney, or judge
                </label>
                <SearchIcon
                  aria-hidden
                  className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)]"
                />
                <Input
                  id="search-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by case name, number, party, attorney, or judge…"
                  className="pl-9 pr-16 h-11 text-[15px]"
                  autoFocus
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]"
                  title="Open command palette"
                >
                  ⌘K
                </span>
              </div>
              <Button variant="accent" size="lg">
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSaving((s) => !s)}
                aria-expanded={saving}
              >
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

          <SavedSearchesPanel
            saved={saved}
            currentQuery={currentQuery}
            saving={saving}
            onStartSave={() => setSaving(true)}
            onCancelSave={() => setSaving(false)}
            onSave={handleSave}
            onDelete={handleDelete}
            onLoad={handleLoad}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Tabs value={scope} onValueChange={setScope}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="patent">Patent</TabsTrigger>
                <TabsTrigger value="securities">Securities</TabsTrigger>
                <TabsTrigger value="antitrust">Antitrust</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3">
              <p className="text-xs font-mono text-[color:var(--color-fg-subtle)] tabular">
                {filtered.length} results · sorted by date filed
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={filtered.length === 0}
                onClick={() => {
                  const rows = filtered.map((d) => ({
                    court: d.court,
                    case_number: d.caseNumber,
                    case_name: d.caseName,
                    nature_of_suit: d.natureOfSuit,
                    nos_code: d.natureOfSuitCode,
                    cause: d.cause,
                    jury_demand: d.juryDemand,
                    status: d.status,
                    judge: d.judge,
                    filed: d.filed,
                    last_filing:
                      d.entries[d.entries.length - 1]?.dateFiled ?? d.filed,
                    entry_count: d.entries.length,
                    plaintiffs: d.parties
                      .filter((p) => /plaintiff|petitioner/i.test(p.role))
                      .map((p) => p.name),
                    defendants: d.parties
                      .filter((p) => /defendant|respondent/i.test(p.role))
                      .map((p) => p.name),
                    tags: d.tags,
                    latest_ai_summary:
                      d.entries[d.entries.length - 1]?.summaryOne ?? "",
                    url: `https://docketlens.ai/dockets/${d.id}`,
                  }));
                  const stamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-")
                    .slice(0, 19);
                  downloadCsv(rows, `docketlens-search-${stamp}.csv`);
                  toast.success("CSV ready", {
                    description: `${rows.length} rows · ${Object.keys(rows[0] ?? {}).length} columns`,
                  });
                }}
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
            </div>
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
                  <CaseResultRow key={d.id} d={d} />
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
