"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================================
 *  LiveHealthDot
 *
 *  Tiny client island that polls /api/health every 60s and renders a
 *  coloured pulse with a textual freshness label. Designed to sit inside
 *  the /status overall banner so the page reflects reality instead of the
 *  build-time synthetic data the rest of the layout uses.
 *
 *  Failure modes:
 *   - On a non-200 response or network error, dot turns rose (warning) and
 *     the label reads "Check failed."
 *   - prefers-reduced-motion users see a flat dot, not a pulse.
 * ==========================================================================*/

type State = "loading" | "ok" | "degraded";

function fmtAgo(ms: number): string {
  if (ms < 5_000) return "just now";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  if (ms < 3600_000) return `${Math.round(ms / 60_000)}m ago`;
  return `${Math.round(ms / 3600_000)}h ago`;
}

export function LiveHealthDot() {
  const [state, setState] = useState<State>("loading");
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  // `now` is updated on a 5s display tick so the "30s ago" label decays
  // in realtime without us calling Date.now() during render (which the
  // react-hooks/purity rule flags as impure).
  const [now, setNow] = useState<number>(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (cancelled) return;
        setState(res.ok ? "ok" : "degraded");
        setCheckedAt(Date.now());
      } catch {
        if (cancelled) return;
        setState("degraded");
        setCheckedAt(Date.now());
      }
    }
    check();
    timerRef.current = setInterval(check, 60_000);
    const display = setInterval(() => setNow(Date.now()), 5_000);
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(display);
    };
  }, []);

  const colour =
    state === "ok"
      ? "bg-[color:var(--color-success)]"
      : state === "degraded"
      ? "bg-[color:var(--color-warning)]"
      : "bg-[color:var(--color-fg-subtle)]";

  const label =
    state === "ok"
      ? checkedAt
        ? `Live check ${fmtAgo(now - checkedAt)}`
        : "Live check…"
      : state === "degraded"
      ? "Check failed — see logs"
      : "Live check…";

  return (
    <span
      className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-muted)]"
      role="status"
      aria-live="polite"
    >
      <span
        className={`relative inline-flex size-2 rounded-full ${colour}`}
        aria-hidden
      >
        {state === "ok" && (
          <span
            className={`motion-safe:animate-ping absolute inline-flex size-full rounded-full opacity-60 ${colour}`}
          />
        )}
      </span>
      {label}
    </span>
  );
}
