"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Users,
  Gavel,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import type { SampleDocket } from "@/lib/sample-data";

/* ============================================================================
 *  CaseResultRow
 *
 *  Search result `<li>` with an on-hover preview popover. The popover lives in
 *  a viewport-`position: fixed` portal-less layer so it isn't clipped by the
 *  enclosing `Card` (which uses `overflow-hidden` for its rounded corners).
 *
 *  Behavior:
 *  - 250 ms enter delay  → avoids fly-by flicker on rapid mouse traversal
 *  - 120 ms leave delay  → forgives small misalignments
 *  - Auto-flips to the left if the right edge would overflow the viewport
 *  - Hides on scroll, resize, and `Esc`
 *  - Click still navigates to /dockets/[id]
 * ==========================================================================*/

const POPOVER_W = 380; // px — must match the rendered width
const POPOVER_OFFSET = 12;
const SHOW_DELAY = 250;
const HIDE_DELAY = 120;

type Coords = { top: number; left: number; side: "right" | "left" };

export function CaseResultRow({ d }: { d: SampleDocket }) {
  const liRef = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const showT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelShow = () => {
    if (showT.current) {
      clearTimeout(showT.current);
      showT.current = null;
    }
  };
  const cancelHide = () => {
    if (hideT.current) {
      clearTimeout(hideT.current);
      hideT.current = null;
    }
  };

  const compute = useCallback((): Coords | null => {
    if (!liRef.current) return null;
    const r = liRef.current.getBoundingClientRect();
    const overflowRight = r.right + POPOVER_OFFSET + POPOVER_W > window.innerWidth;
    const side: "right" | "left" = overflowRight ? "left" : "right";
    const left =
      side === "right"
        ? r.right + POPOVER_OFFSET
        : Math.max(8, r.left - POPOVER_W - POPOVER_OFFSET);
    // Clamp top so the popover stays in the viewport
    const top = Math.max(8, Math.min(r.top, window.innerHeight - 280));
    return { top, left, side };
  }, []);

  const handleEnter = () => {
    cancelHide();
    showT.current = setTimeout(() => {
      const c = compute();
      if (!c) return;
      setCoords(c);
      setOpen(true);
    }, SHOW_DELAY);
  };
  const handleLeave = () => {
    cancelShow();
    hideT.current = setTimeout(() => setOpen(false), HIDE_DELAY);
  };

  // Close on scroll, resize, or escape — anything that invalidates the anchor.
  useEffect(() => {
    if (!open) return;
    const onAny = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", onAny, { passive: true, capture: true });
    window.addEventListener("resize", onAny);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onAny, true);
      window.removeEventListener("resize", onAny);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => {
    cancelShow();
    cancelHide();
  }, []);

  const lastEntry = d.entries[d.entries.length - 1];
  const plaintiffs = d.parties.filter((p) => /plaintiff|petitioner/i.test(p.role));
  const defendants = d.parties.filter((p) => /defendant|respondent/i.test(p.role));

  return (
    <li
      ref={liRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      aria-describedby={open ? `preview-${d.id}` : undefined}
      className="border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors relative"
    >
      <Link href={`/dockets/${d.id}` as never} className="block px-5 py-5">
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
            Last filing {timeAgo(lastEntry?.dateFiled ?? d.filed)}
            <ArrowUpRight className="size-3" />
          </span>
        </div>
        <h3 className="mt-2 text-base font-medium tracking-tight">{d.caseName}</h3>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
          {d.natureOfSuit} · {d.judge} ·{" "}
          <span className="font-mono">{d.entries.length}</span> docket entries
        </p>
        {lastEntry?.summaryOne && (
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
            <span className="text-[color:var(--color-accent)] font-medium">
              Latest:
            </span>{" "}
            {lastEntry.summaryOne}
          </p>
        )}
      </Link>

      <AnimatePresence>
        {open && coords && (
          <motion.div
            id={`preview-${d.id}`}
            role="tooltip"
            initial={{
              opacity: 0,
              x: coords.side === "right" ? -6 : 6,
              scale: 0.985,
            }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={cancelHide}
            onMouseLeave={handleLeave}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: POPOVER_W,
              zIndex: 60,
            }}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-soft p-5 pointer-events-auto"
          >
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                {d.courtFull} · {d.caseNumber}
              </span>
              <Badge variant={d.status === "Open" ? "success" : "default"}>
                {d.status}
              </Badge>
            </div>
            <p className="font-serif text-lg leading-tight tracking-tight">
              {d.caseName}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
              {d.natureOfSuit}
              <span className="text-[color:var(--color-fg-subtle)]"> · {d.cause}</span>
            </p>

            {lastEntry?.summaryOne && (
              <div className="mt-3 rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/30 p-2.5">
                <p className="text-[10.5px] uppercase tracking-[0.18em] font-medium text-[color:var(--color-fg-subtle)] mb-1">
                  <Sparkles className="inline size-3 mr-1 -translate-y-px" />
                  Latest filing · {lastEntry.type}
                </p>
                <p className="text-[12.5px] leading-snug text-[color:var(--color-fg)]">
                  {lastEntry.summaryOne}
                </p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="eyebrow mb-1.5 text-[10px]">
                  <Users className="inline size-3 mr-1 -translate-y-px" />
                  Plaintiff{plaintiffs.length === 1 ? "" : "s"}
                </p>
                <ul className="text-[12px] leading-snug space-y-1 text-[color:var(--color-fg)]">
                  {(plaintiffs.length > 0 ? plaintiffs : [d.parties[0]])
                    .slice(0, 2)
                    .map((p) => (
                      <li key={p.id} className="truncate" title={p.name}>
                        {p.name}
                      </li>
                    ))}
                  {plaintiffs.length > 2 && (
                    <li className="text-[color:var(--color-fg-subtle)] font-mono text-[10.5px]">
                      +{plaintiffs.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-1.5 text-[10px]">
                  <FileText className="inline size-3 mr-1 -translate-y-px" />
                  Defendant{defendants.length === 1 ? "" : "s"}
                </p>
                <ul className="text-[12px] leading-snug space-y-1 text-[color:var(--color-fg)]">
                  {(defendants.length > 0 ? defendants : [d.parties[1] ?? d.parties[0]])
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => (
                      <li key={p.id} className="truncate" title={p.name}>
                        {p.name}
                      </li>
                    ))}
                  {defendants.length > 2 && (
                    <li className="text-[color:var(--color-fg-subtle)] font-mono text-[10.5px]">
                      +{defendants.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[color:var(--color-border)] flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-mono text-[color:var(--color-fg-subtle)]">
                <Gavel className="size-3" />
                {d.judge}
              </span>
              <Link
                href={`/dockets/${d.id}` as never}
                className="inline-flex items-center gap-1 text-[color:var(--color-accent)] hover:underline font-medium"
              >
                Open case
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
