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

  // Honor `/search?court=<slug>` deep-links from /jurisdictions. If no URL
  // params arrive, fall back to the user's last unsaved query from
  // localStorage so a tab close + reopen doesn't lose their filters.
  const searchParams = useSearchParams();
  useEffect(() => {
    const courtParam = searchParams.get("court");
    const qParam = searchParams.get("q");
    const hasUrlParams = courtParam !== null || qParam !== null;

    if (hasUrlParams) {
      if (courtParam) {
        const short = SLUG_TO_SHORT[courtParam] ?? courtParam;
        setActiveCourt(short);
      }
      if (qParam) setQ(qParam);
      return;
    }
    // No URL params → restore localStorage snapshot if present
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("dl-search-last");
      if (!raw) return;
      const snap = JSON.parse(raw) as {
        q?: string;
        court?: string | null;
        nos?: string | null;
        scope?: string;
      };
      if (snap.q) setQ(snap.q);
      if (snap.court) setActiveCourt(snap.court);
      if (snap.nos) setActiveNos(snap.nos);
      if (snap.scope) setScope(snap.scope);
    } catch {
      // Corrupted snapshot — ignore. We'll overwrite on the next change.
    }
  }, [searchParams]);

  // Persist the current filter set as the user types/clicks. Debounced so
  // every keystroke isn't a write. localStorage only — no server roundtrip.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(
          "dl-search-last",
          JSON.stringify({ q, court: activeCourt, nos: activeNos, scope })
        );
      } catch {
        // Quota / blocked / privacy mode — fail silently.
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, activeCourt, activeNos, scope]);

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

  // Hoist the CSV export so both the button onClick and the ⌘E shortcut
  // share one code path. Reads the latest `filtered` via closure.
  const exportCsv = () => {
    if (filtered.length === 0) {
      toast("Nothing to export", { description: "Broaden the filters first." });
      return;
    }
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
  };

  // ⌘E / Ctrl+E → export current results. ↑/↓ → walk between result rows
  // and `Enter` opens the focused one. Both gated on the active element
  // NOT being a text input so typing isn't hijacked.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const editable =
        tag === "input" ||
        tag === "textarea" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      // ⌘E export
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        if (editable) return;
        e.preventDefault();
        exportCsv();
        return;
      }

      // Arrow-key row navigation
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter")
        return;
      if (editable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const rows = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(
          'ul > li a[href^="/dockets/"]'
        )
      );
      if (rows.length === 0) return;

      // Figure out current index from active element if it's a row link.
      const active = document.activeElement as HTMLAnchorElement | null;
      const currentIdx = active ? rows.indexOf(active) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = rows[Math.min(currentIdx + 1, rows.length - 1)] ?? rows[0];
        next.focus({ preventScroll: true });
        next.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIdx <= 0) return;
        const prev = rows[currentIdx - 1];
        prev.focus({ preventScroll: true });
        prev.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "Enter" && currentIdx >= 0) {
        // Anchor.click() respects modifier keys + opens via the router.
        // No preventDefault — let the browser navigate.
        rows[currentIdx].click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // exportCsv captures the latest `filtered` via closure on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

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
      <main id="main" className="flex-1 overflow-y-auto">
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
                onClick={exportCsv}
                title="Export current results as CSV (⌘E / Ctrl+E)"
              >
                <Download className="size-3.5" />
                Export CSV
                <span
                  aria-hidden
                  className="ml-1 hidden md:inline-flex items-center rounded-md border border-[color:var(--color-border)] px-1 py-0 font-mono text-[9.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]"
                >
                  ⌘E
                </span>
              </Button>
            </div>
          </div>

          {/* Recent-courts strip — only shown on a fresh /search view
              (no query + no filters). Surfaces the top 6 courts by case
              count across the seeded corpus as a one-click filter shortcut. */}
          {!q && !activeCourt && !activeNos && scope === "all" && (() => {
            const counts: Record<string, number> = {};
            for (const d of SAMPLE_DOCKETS) {
              counts[d.court] = (counts[d.court] ?? 0) + 1;
            }
            const top = Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6);
            if (top.length === 0) return null;
            return (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40 p-4">
                <p className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-2.5">
                  Popular last 7 days
                </p>
                <div className="flex flex-wrap gap-2">
                  {top.map(([court, n]) => (
                    <button
                      key={court}
                      type="button"
                      onClick={() => setActiveCourt(court)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1 font-mono text-[11.5px] text-[color:var(--color-fg)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] transition-colors"
                      aria-label={`Filter to ${court} (${n} cases)`}
                    >
                      <span>{court}</span>
                      <span className="text-[color:var(--color-fg-subtle)]">
                        {n}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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
