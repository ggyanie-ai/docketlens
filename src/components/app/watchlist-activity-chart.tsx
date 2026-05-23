"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeData(seed: string) {
  const days = 30;
  const rng = mulberry32(hash(seed));
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 86400000);
    const wkend = [0, 6].includes(d.getDay());
    const base = wkend ? 0.6 : 2.4 + rng() * 2;
    const seasonal = Math.sin((i / days) * Math.PI * 2) * 1.2;
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      matches: Math.max(0, Math.round(base + seasonal + rng() * 1.5)),
    };
  });
}

export function WatchlistActivityChart({ seed }: { seed: string }) {
  const data = makeData(seed);

  return (
    <div style={{ width: "100%", height: 200, minHeight: 200 }}>
      <ResponsiveContainer minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-fg-subtle)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: "var(--color-fg-subtle)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--color-bg-subtle)" }}
            content={(props) => {
              if (!props.active || !props.payload?.[0]) return null;
              const p = props.payload[0];
              return (
                <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 shadow-soft text-xs">
                  <p className="font-mono text-[color:var(--color-fg-subtle)]">
                    {p.payload.label}
                  </p>
                  <p className="font-medium mt-0.5">
                    <span className="font-serif text-base tabular">
                      {p.value}
                    </span>{" "}
                    matches
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="matches"
            fill="var(--color-accent)"
            radius={[3, 3, 0, 0]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
