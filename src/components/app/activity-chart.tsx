"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function makeData() {
  const days = 30;
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 86400000);
    const wkend = [0, 6].includes(d.getDay());
    const base = wkend ? 2 : 10 + Math.sin(i / 3) * 4;
    const noise = Math.random() * 6;
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      filings: Math.max(0, Math.round(base + noise)),
    };
  });
}

const DATA = makeData();

export function ActivityChart() {
  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <AreaChart data={DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dl-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
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
          />
          <Tooltip
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
                    filings
                  </p>
                </div>
              );
            }}
            cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="filings"
            stroke="var(--color-accent)"
            strokeWidth={1.75}
            fill="url(#dl-area)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
