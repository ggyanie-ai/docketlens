"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Gavel, Briefcase, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const JUDGES = [
  { name: "Hon. Roy S. Payne",       court: "E.D. Tex.",   filings: 142, trend: 12 },
  { name: "Hon. William Alsup",       court: "N.D. Cal.",   filings: 118, trend: -3 },
  { name: "Hon. Leonard P. Stark",    court: "D. Del.",     filings: 109, trend: 8 },
  { name: "Hon. Aileen R. Castillo",  court: "S.D.N.Y.",    filings: 97,  trend: 22 },
  { name: "Hon. Maya Patel-Brown",    court: "D.D.C.",      filings: 84,  trend: 5 },
  { name: "Hon. Marcus T. Ouyang",    court: "N.D. Cal.",   filings: 71,  trend: 14 },
  { name: "Hon. Renata B. Velasquez", court: "S.D.N.Y.",    filings: 68,  trend: -1 },
  { name: "Hon. Geoffrey R. Sand",    court: "C.D. Cal.",   filings: 52,  trend: 9 },
];

const FIRMS = [
  { name: "Kirkland & Ellis LLP",       cases: 218, trend: 14 },
  { name: "Latham & Watkins LLP",       cases: 196, trend: 7 },
  { name: "Quinn Emanuel Urquhart",     cases: 174, trend: 21 },
  { name: "Skadden, Arps, Slate",       cases: 153, trend: -2 },
  { name: "Wachtell, Lipton, Rosen",    cases: 142, trend: 4 },
  { name: "Wilson Sonsini Goodrich",    cases: 128, trend: 18 },
  { name: "Paul, Weiss, Rifkind",       cases: 116, trend: -6 },
  { name: "Sullivan & Cromwell LLP",    cases: 104, trend: 3 },
];

const PARTIES = [
  { name: "Apple Inc.",                cases: 87, trend: 11 },
  { name: "Alphabet Inc. / Google LLC",cases: 79, trend: 6 },
  { name: "Amazon.com, Inc.",          cases: 74, trend: 19 },
  { name: "Meta Platforms, Inc.",      cases: 62, trend: -4 },
  { name: "Microsoft Corporation",     cases: 58, trend: 8 },
  { name: "Tesla, Inc.",               cases: 51, trend: 27 },
  { name: "Oracle Corporation",        cases: 38, trend: -2 },
  { name: "OpenAI, Inc.",              cases: 34, trend: 41 },
];

type Tab = "judges" | "firms" | "parties";

export function Leaderboard() {
  const [tab, setTab] = useState<Tab>("judges");

  const rows =
    tab === "judges"
      ? JUDGES.map((j) => ({
          key: j.name,
          primary: j.name,
          secondary: j.court,
          value: j.filings,
          trend: j.trend,
          icon: Gavel,
        }))
      : tab === "firms"
      ? FIRMS.map((f) => ({
          key: f.name,
          primary: f.name,
          secondary: "Counsel of record",
          value: f.cases,
          trend: f.trend,
          icon: Briefcase,
        }))
      : PARTIES.map((p) => ({
          key: p.name,
          primary: p.name,
          secondary: "Across all districts",
          value: p.cases,
          trend: p.trend,
          icon: Building2,
        }));

  const max = Math.max(...rows.map((r) => r.value));

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-medium leading-tight tracking-tight">
            Most active — 90 days
          </h3>
          <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5 leading-relaxed">
            Top judges, firms, and corporate defendants by filings touched.
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="firms">Firms</TabsTrigger>
            <TabsTrigger value="parties">Corporate parties</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ol className="flex flex-col">
        {rows.map((r, i) => {
          const t = r.value / max;
          return (
            <li
              key={r.key}
              className="grid grid-cols-[1.4rem_minmax(0,1fr)_120px_56px_44px] items-center gap-3 border-t border-[color:var(--color-border)] py-2.5 first:border-t-0 group hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors rounded-[var(--radius-sm)] px-2 -mx-2"
            >
              <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] tabular text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex items-center gap-2">
                <r.icon className="size-3.5 text-[color:var(--color-fg-subtle)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">
                    {r.primary}
                  </p>
                  <p className="text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] truncate">
                    {r.secondary}
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[color:var(--color-bg-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[color:var(--color-accent)] transition-[width] duration-500"
                  style={{ width: `${Math.round(t * 100)}%` }}
                />
              </div>
              <span className="font-mono text-sm tabular text-right">
                {r.value}
              </span>
              <span
                className={`font-mono text-[11px] tabular text-right ${
                  r.trend > 0
                    ? "text-[color:var(--color-success)]"
                    : r.trend < 0
                    ? "text-[color:var(--color-warning)]"
                    : "text-[color:var(--color-fg-subtle)]"
                }`}
              >
                {r.trend > 0 ? "+" : ""}
                {r.trend}%
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
          Trailing 90 days · all federal districts
        </p>
        <Button asChild variant="ghost" size="sm">
          <Link href={"/search" as never}>
            Browse all
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
