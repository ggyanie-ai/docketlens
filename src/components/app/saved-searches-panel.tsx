"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Trash2,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  newSavedSearch,
  summarizeQuery,
  suggestName,
  type SavedSearch,
} from "@/lib/saved-searches";

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
                  <button
                    type="button"
                    onClick={() => onLoad(s)}
                    aria-label={`Load saved search "${s.name}"`}
                    className="inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors"
                    title="Load"
                  >
                    <Play className="size-3.5" />
                  </button>
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
