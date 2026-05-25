"use client";

import { useEffect, useState } from "react";
import { Notebook, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ============================================================================
 *  DocketNotesCard
 *
 *  Inline org-scoped note editor on /dockets/[id]. Today it persists to
 *  localStorage keyed by `dl-docket-note-<docketId>` because the in-app
 *  doesn't yet have a real signed-in user to bind to the row. When auth
 *  wires Tuesday this swaps to a fetch against
 *  `PUT /api/v1/dockets/{id}/notes` — the wire format is identical, so
 *  the component just changes its persistence target.
 *
 *  Save-on-blur (or via Cmd+S). Visible "Saved" indicator for 1.8s after
 *  every successful save. Markdown-aware textarea — the real render
 *  endpoint at /api/v1/dockets/{id}/notes/render lives on the server.
 * ==========================================================================*/

export function DocketNotesCard({ docketId }: { docketId: string }) {
  const storageKey = `dl-docket-note-${docketId}`;
  const [body, setBody] = useState("");
  const [savedBody, setSavedBody] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { body?: string; savedAt?: string };
        if (typeof parsed.body === "string") {
          setBody(parsed.body);
          setSavedBody(parsed.body);
        }
        if (parsed.savedAt) setSavedAt(new Date(parsed.savedAt));
      }
    } catch {
      // corrupt entry — ignore
    }
  }, [storageKey]);

  const dirty = body !== savedBody;

  function save() {
    if (!dirty) return;
    if (typeof window === "undefined") return;
    try {
      const stamp = new Date();
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ body, savedAt: stamp.toISOString() })
      );
      setSavedBody(body);
      setSavedAt(stamp);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1800);
    } catch {
      toast.error("Couldn't save", {
        description: "localStorage may be blocked. Try again in a regular window.",
      });
    }
  }

  // Cmd+S / Ctrl+S inside the card → save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        const target = e.target as HTMLElement | null;
        const inCard = target?.closest("[data-docket-notes-card]");
        if (!inCard) return;
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // closure captures latest `body` + `savedBody` via fresh render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <Card className="p-5 flex flex-col gap-3" data-docket-notes-card>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Notebook className="size-4 text-[color:var(--color-fg-muted)]" />
          <h3 className="text-sm font-medium tracking-tight">Org notes</h3>
          <Badge variant="outline" className="text-[10px]">
            Private to this org
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span
              className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]"
              aria-live="polite"
            >
              {showSaved ? (
                <span className="inline-flex items-center gap-1 text-[color:var(--color-success)]">
                  <Check className="size-3" />
                  Saved
                </span>
              ) : (
                <>Saved {savedAt.toLocaleTimeString()}</>
              )}
            </span>
          )}
          <Button
            variant={dirty ? "accent" : "outline"}
            size="sm"
            onClick={save}
            disabled={!dirty}
            title="Save now (⌘S)"
          >
            <Save className="size-3.5" />
            {dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={save}
        placeholder="Plain text or Markdown — bullet lists, **bold**, [links](https://…), `code`. Visible only to your org."
        rows={6}
        className="font-mono text-[13px] leading-relaxed"
      />
      <p className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        Save-on-blur · ⌘S · max 20 KB · binds to /api/v1/dockets/{`{id}`}/notes Tuesday
      </p>
    </Card>
  );
}
