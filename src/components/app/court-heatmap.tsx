"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ============================================================================
 *  CourtHeatmap
 *
 *  Court × Month density grid. Deterministic synthetic data so the demo is
 *  stable across reloads (seeded PRNG keyed by court + month + nos).
 *  Cell color interpolates between bg-subtle and accent using OKLCH so the
 *  scale stays perceptually uniform.
 * ==========================================================================*/

const COURTS = [
  { id: "nysd", short: "S.D.N.Y." },
  { id: "cand", short: "N.D. Cal." },
  { id: "ded",  short: "D. Del." },
  { id: "txed", short: "E.D. Tex." },
  { id: "dcd",  short: "D.D.C." },
  { id: "cacd", short: "C.D. Cal." },
  { id: "ilnd", short: "N.D. Ill." },
  { id: "vaed", short: "E.D. Va." },
];

const NOS_PRESETS = [
  { key: "all",        label: "All cases",  base: 14, swing: 5 },
  { key: "patent",     label: "Patent",     base: 4,  swing: 3 },
  { key: "securities", label: "Securities", base: 3,  swing: 3 },
  { key: "antitrust",  label: "Antitrust",  base: 1,  swing: 2 },
  { key: "trade",      label: "Trade secret", base: 1, swing: 1.5 },
] as const;

type NosKey = (typeof NOS_PRESETS)[number]["key"];

/** Small deterministic PRNG so the grid is stable across renders. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeMatrix(nos: NosKey) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    return {
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
    };
  });

  const preset = NOS_PRESETS.find((p) => p.key === nos)!;

  // Per-court bias: SDNY + CAND are busier than D.D.C.
  const COURT_BIAS: Record<string, number> = {
    nysd: 1.45, cand: 1.35, ded: 1.2, txed: 1.1,
    dcd: 0.85, cacd: 1.1, ilnd: 0.9, vaed: 0.8,
  };
  // Per-court NOS bias: patent → DED + TXED spike
  const NOS_COURT_BIAS: Record<string, Record<string, number>> = {
    patent:     { ded: 1.8, txed: 1.9, cand: 1.4, nysd: 1.1 },
    securities: { nysd: 1.95, cacd: 1.3, ilnd: 1.2 },
    antitrust:  { dcd: 1.9, cand: 1.5, nysd: 1.4 },
    trade:      { cand: 1.6, nysd: 1.4, ded: 1.1 },
    all:        {},
  };

  const rows = COURTS.map((c) => {
    return {
      court: c,
      cells: months.map((m) => {
        const rng = mulberry32(hashStr(`${c.id}|${m.key}|${nos}`));
        const courtFactor = COURT_BIAS[c.id] ?? 1;
        const nosFactor = NOS_COURT_BIAS[nos]?.[c.id] ?? 1;
        // Seasonal sin (Q4 dips, Q1 spikes)
        const seasonal = 1 + Math.sin((months.indexOf(m) / 12) * Math.PI * 2 + 1.3) * 0.18;
        const raw =
          (preset.base + rng() * preset.swing * 2) *
          courtFactor *
          nosFactor *
          seasonal;
        return { month: m, value: Math.round(raw) };
      }),
    };
  });

  // Compute domain
  const allVals = rows.flatMap((r) => r.cells.map((c) => c.value));
  const max = Math.max(...allVals, 1);

  return { rows, months, max };
}

export function CourtHeatmap() {
  const [nos, setNos] = useState<NosKey>("all");
  const [hover, setHover] = useState<{
    court: string;
    monthLabel: string;
    year: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const { rows, months, max } = useMemo(() => makeMatrix(nos), [nos]);

  const cellW = 36;
  const cellH = 28;
  const labelW = 60;
  const headerH = 18;

  const width = labelW + months.length * cellW;
  const height = headerH + rows.length * cellH;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-medium leading-tight tracking-tight">
            Filings density · court × month
          </h3>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5 leading-relaxed max-w-md">
            12-month heatmap of new filings across top federal districts.
            Hover any cell for the exact count.
          </p>
        </div>
        <Tabs value={nos} onValueChange={(v) => setNos(v as NosKey)}>
          <TabsList>
            {NOS_PRESETS.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative overflow-x-auto mask-fade-edges">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Court filings density heatmap"
          className="block"
        >
          {/* Header row — months */}
          {months.map((m, mi) => (
            <text
              key={m.key}
              x={labelW + mi * cellW + cellW / 2}
              y={12}
              textAnchor="middle"
              className="fill-[color:var(--color-fg-subtle)]"
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {m.label}
            </text>
          ))}

          {/* Rows */}
          {rows.map((r, ri) => {
            const y = headerH + ri * cellH;
            return (
              <g key={r.court.id}>
                <text
                  x={labelW - 8}
                  y={y + cellH / 2 + 3.5}
                  textAnchor="end"
                  className="fill-[color:var(--color-fg-muted)]"
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.court.short}
                </text>
                {r.cells.map((cell, ci) => {
                  const t = cell.value / max;
                  // OKLCH lightness interpolation from subtle bg → accent
                  // Light theme keeps it readable, dark theme too.
                  const lightness = 96 - t * 24; // 96% → 72%
                  const chroma = 0.008 + t * 0.16;
                  const hue = 70 - t * 8;
                  return (
                    <rect
                      key={cell.month.key}
                      x={labelW + ci * cellW + 2}
                      y={y + 2}
                      width={cellW - 4}
                      height={cellH - 4}
                      rx={3}
                      fill={`oklch(${lightness}% ${chroma} ${hue})`}
                      stroke="oklch(var(--cell-stroke, 100% 0 0) / 0)"
                      className="dark:[stroke:oklch(20%_0.020_260)] [stroke-opacity:1] transition-[stroke-width]"
                      strokeWidth={1}
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGRectElement).getBoundingClientRect();
                        const parent = (e.target as SVGRectElement)
                          .ownerSVGElement!.parentElement!.getBoundingClientRect();
                        setHover({
                          court: r.court.short,
                          monthLabel: cell.month.label,
                          year: cell.month.year,
                          value: cell.value,
                          x: rect.left - parent.left + rect.width / 2,
                          y: rect.top - parent.top,
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {hover && (
          <div
            role="tooltip"
            className="pointer-events-none absolute rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 shadow-soft text-xs animate-fade-in-up"
            style={{
              left: hover.x,
              top: hover.y - 12,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              {hover.court} · {hover.monthLabel} {hover.year}
            </p>
            <p className="mt-1 font-medium">
              <span className="font-serif text-base tabular">{hover.value}</span>{" "}
              filings
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4 text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
        <span>0</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gradient-to-r from-[oklch(96%_0.008_70)] via-[oklch(85%_0.060_70)] to-[oklch(72%_0.165_65)]" />
        <span className="tabular">{max}</span>
        <span className="ml-3 text-[10px] uppercase tracking-[0.18em]">
          filings / mo
        </span>
      </div>
    </Card>
  );
}
