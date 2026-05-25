"use client";

import { useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ActivityChart } from "@/components/app/activity-chart";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  ActivityChartCard
 *
 *  Wraps the Activity chart with a 7d / 30d / 90d range picker. The total
 *  number + delta in the corner derive from the same window so they stay
 *  consistent with what the chart shows.
 *
 *  Total + delta are deterministic per `range` so the chart doesn't flicker
 *  between renders.
 * ==========================================================================*/

type Range = 7 | 30 | 90;
const OPTIONS: { value: Range; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

function totals(range: Range): { total: number; delta: string } {
  // Same shape we used on the static card — deterministic from `range`
  // so the small numbers feel coherent with the chart.
  switch (range) {
    case 7:
      return { total: 78, delta: "+12%" };
    case 90:
      return { total: 941, delta: "+18%" };
    case 30:
    default:
      return { total: 312, delta: "+24%" };
  }
}

export function ActivityChartCard() {
  const [range, setRange] = useState<Range>(30);
  const { total, delta } = totals(range);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-1 gap-3 flex-wrap">
        <div>
          <CardTitle className="text-sm">
            Activity — last {range} days
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            New filings matched across all your watchlists.
          </CardDescription>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl tabular leading-none">
            {total}
          </span>
          <span className="text-xs text-[color:var(--color-success)] font-mono">
            {delta}
          </span>
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label="Activity range"
        className="mt-3 inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-0.5"
      >
        {OPTIONS.map((o) => {
          const active = o.value === range;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              type="button"
              onClick={() => setRange(o.value)}
              className={cn(
                "rounded-[var(--radius-sm)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                active
                  ? "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg)]"
                  : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 -mx-2">
        <ActivityChart days={range} />
      </div>
    </Card>
  );
}
