"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Trash2,
  Play,
  Sparkles,
  Rss,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import {
  newSavedSearch,
  summarizeQuery,
  suggestName,
  type SavedSearch,
} from "@/lib/saved-searches";
import { runSearch } from "@/lib/search/filter";

/* ============================================================================
 *  SavedSearchesPanel
 *
 *  Renders the list of saved searches and the inline "save current" mini-form.
 *  Pure presentation + form local state — all persistence lives in the parent
 *  via the `onSave`, `onDelete`, `onLoad` callbacks.
 * ==========================================================================*/

interface Props {
  saved: SavedSearch[];
  currentQuery: SavedSearch["query"];
  saving: boolean;
  onStartSave: () => void;
  onCancelSave: () => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onLoad: (s: SavedSearch) => void;
}

export function SavedSearchesPanel({
  saved,
  currentQuery,
  saving,
  onStartSave,
  onCancelSave,
  onSave,
  onDelete,
  onLoad,
}: Props) {
  const [draftName, setDraftName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = draftName.trim() || suggestName(currentQuery);
    if (saved.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Name already used", {
        description: "Pick a different name or rename the existing entry.",
      });
      return;
    }
    onSave(name);
    setDraftName("");
    toast.success("Search saved", {
      description: `"${name}" will show up here every time you visit /search.`,
    });
  }

  function deleteOne(s: SavedSearch) {
    onDelete(s.id);
    toast("Saved search removed", {
      description: `"${s.name}" is gone.`,
    });
  }

  /**
   * Build an absolute feed URL for one saved search in the chosen format.
   *
   * The {id} path segment is a stable guid prefix; the actual filters travel
   * as query params, matching the v0 contract of
   * /api/v1/saved-searches/[id]/feed.*. When DB-backed saved searches land
   * the params become optional.
   */
  function feedUrl(s: SavedSearch, ext: "xml" | "atom" | "json"): string {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://docketlens.ai";
    const sp = new URLSearchParams();
    if (s.query.q) sp.set("q", s.query.q);
    if (s.query.court) sp.set("court", s.query.court);
    if (s.query.nos) sp.set("nos", s.query.nos);
    if (s.query.scope && s.query.scope !== "all") sp.set("scope", s.query.scope);
    sp.set("name", s.name);
    return `${origin}/api/v1/saved-searches/${encodeURIComponent(
      s.id
    )}/feed.${ext}?${sp.toString()}`;
  }

  const FORMAT_LABEL: Record<"xml" | "atom" | "json", string> = {
    xml: "RSS 2.0",
    atom: "Atom 1.0",
    json: "JSON Feed 1.1",
  };

  async function copyFeed(s: SavedSearch, ext: "xml" | "atom" | "json") {
    const url = feedUrl(s, ext);
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${FORMAT_LABEL[ext]} URL copied`, {
        description:
          "Paste it into any feed reader. Treat the URL like a secret — anyone with it can read this feed.",
      });
    } catch {
      toast.error("Couldn't copy", {
        description: "Clipboard blocked. Manually copy from the URL preview.",
      });
    }
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-[color:var(--color-fg-muted)]" />
          <h3 className="text-sm font-medium tracking-tight">
            Saved searches
          </h3>
          {saved.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {saved.length}
            </Badge>
          )}
        </div>
        {!saving && (
          <Button variant="outline" size="sm" onClick={onStartSave}>
            <BookmarkPlus className="size-3.5" />
            Save current
          </Button>
        )}
      </div>

      {saving && (
        <form
          onSubmit={submit}
          className="flex flex-col sm:flex-row gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/20 p-3"
        >
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={suggestName(currentQuery)}
            aria-label="Saved search name"
            autoFocus
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="accent" size="md">
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => {
                setDraftName("");
                onCancelSave();
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        </form>
      )}

      {saved.length === 0 && !saving ? (
        <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
          You haven&apos;t saved any searches yet. Tweak the filters above and
          hit{" "}
          <span className="font-medium text-[color:var(--color-fg)]">
            Save current
          </span>{" "}
          to come back to this view in one click.
        </p>
      ) : (
        saved.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {saved.map((s) => (
              <li key={s.id}>
                <div className="group flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 hover:border-[color:var(--color-border-strong)] transition-colors">
                  <Sparkles className="size-3.5 shrink-0 text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] truncate">
                      {summarizeQuery(s.query)}
                    </p>
                  </div>
                  {(() => {
                    // Live match-count badge, computed in-memory against
                    // SAMPLE_DOCKETS via the shared runSearch() helper.
                    // No DB roundtrip; recomputes on every render but the
                    // dataset is small.
                    const n = runSearch(s.query).length;
                    return (
                      <span
                        className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/60 px-2 py-0.5 font-mono text-[10.5px] text-[color:var(--color-fg-muted)]"
                        title={`${n} matching ${n === 1 ? "case" : "cases"}`}
                      >
                        {n}
                        <span className="text-[color:var(--color-fg-subtle)] uppercase tracking-wider">
                          {n === 1 ? "match" : "matches"}
                        </span>
                      </span>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => onLoad(s)}
                    aria-label={`Load saved search "${s.name}"`}
                    className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors"
                    title="Load"
                  >
                    <Play className="size-3.5" />
                  </button>
                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        aria-label={`Copy feed URL for "${s.name}"`}
                        title="Copy feed URL"
                        className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-accent)] transition-colors"
                      >
                        <Rss className="size-3.5" />
                      </button>
                    }
                    align="end"
                  >
                    <DropdownLabel>Copy feed URL</DropdownLabel>
                    <DropdownItem onClick={() => copyFeed(s, "xml")}>
                      <Rss className="size-3.5 text-[color:var(--color-accent)]" />
                      <span className="flex-1">RSS 2.0</span>
                      <span className="text-[10px] font-mono text-[color:var(--color-fg-subtle)]">
                        .xml
                      </span>
                    </DropdownItem>
                    <DropdownItem onClick={() => copyFeed(s, "atom")}>
                      <Rss className="size-3.5 text-[color:var(--color-fg-muted)]" />
                      <span className="flex-1">Atom 1.0</span>
                      <span className="text-[10px] font-mono text-[color:var(--color-fg-subtle)]">
                        .atom
                      </span>
                    </DropdownItem>
                    <DropdownItem onClick={() => copyFeed(s, "json")}>
                      <Rss className="size-3.5 text-[color:var(--color-fg-muted)]" />
                      <span className="flex-1">JSON Feed 1.1</span>
                      <span className="text-[10px] font-mono text-[color:var(--color-fg-subtle)]">
                        .json
                      </span>
                    </DropdownItem>
                    <DropdownSeparator />
                    <div className="px-2.5 py-1 text-[11px] leading-snug text-[color:var(--color-fg-muted)]">
                      RSS is the safe default. Use Atom for richer per-entry
                      metadata, JSON Feed for modern readers.
                    </div>
                  </Dropdown>
                  <button
                    type="button"
                    onClick={() => deleteOne(s)}
                    aria-label={`Delete saved search "${s.name}"`}
                    className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-subtle)] hover:bg-[color:var(--color-danger)]/12 hover:text-[color:var(--color-danger)] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </Card>
  );
}
