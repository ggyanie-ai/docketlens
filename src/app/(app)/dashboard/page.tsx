import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  FileText,
  Bell,
  ArrowUpRight,
  Sparkles,
  Gavel,
  Scale,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SAMPLE_DOCKETS, SAMPLE_WATCHLISTS } from "@/lib/sample-data";
import { timeAgo } from "@/lib/utils";
import { ActivityChart } from "@/components/app/activity-chart";
import { CourtHeatmap } from "@/components/app/court-heatmap";
import { Leaderboard } from "@/components/app/leaderboard";

const KPIS = [
  {
    label: "Watchlists",
    value: "4",
    delta: "+1 this week",
    trend: "up" as const,
    icon: Bookmark,
  },
  {
    label: "Matches today",
    value: "24",
    delta: "+18% vs yesterday",
    trend: "up" as const,
    icon: FileText,
  },
  {
    label: "Pending alerts",
    value: "12",
    delta: "next digest 7:00 am",
    trend: "neutral" as const,
    icon: Bell,
  },
  {
    label: "AI summaries",
    value: "146",
    delta: "47 left this month",
    trend: "down" as const,
    icon: Sparkles,
  },
];

const ENTRY_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

export default function DashboardPage() {
  const recentEntries = SAMPLE_DOCKETS.flatMap((d) =>
    d.entries.map((e) => ({ docket: d, entry: e }))
  )
    .sort(
      (a, b) =>
        new Date(b.entry.dateFiled).getTime() -
        new Date(a.entry.dateFiled).getTime()
    )
    .slice(0, 6);

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
          {/* KPIs */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              {KPIS.map((k) => (
                <Card
                  key={k.label}
                  className="rounded-none border-0 bg-[color:var(--color-bg)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">{k.label}</p>
                    <k.icon className="size-4 text-[color:var(--color-fg-subtle)]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl tabular leading-none">
                    {k.value}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)]">
                    {k.trend === "up" && (
                      <TrendingUp className="size-3 text-[color:var(--color-success)]" />
                    )}
                    {k.trend === "down" && (
                      <TrendingDown className="size-3 text-[color:var(--color-warning)]" />
                    )}
                    {k.delta}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* Activity chart */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <CardTitle className="text-sm">Activity — last 30 days</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    New filings matched across all your watchlists.
                  </CardDescription>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl tabular leading-none">
                    312
                  </span>
                  <span className="text-xs text-[color:var(--color-success)] font-mono">
                    +24%
                  </span>
                </div>
              </div>
              <div className="mt-4 -mx-2">
                <ActivityChart />
              </div>
            </Card>

            {/* Watchlists summary */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4 flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Your watchlists</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Newest matches in the past 24 hours.
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={"/watchlists" as never}>
                    View all
                    <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              </CardHeader>
              <ul className="flex flex-col">
                {SAMPLE_WATCHLISTS.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center gap-3 border-t border-[color:var(--color-border)] py-3 first:border-t-0"
                  >
                    <span
                      className={
                        w.color === "amber"
                          ? "size-2 rounded-full bg-[color:var(--color-accent)]"
                          : w.color === "navy"
                          ? "size-2 rounded-full bg-[color:var(--color-info)]"
                          : w.color === "emerald"
                          ? "size-2 rounded-full bg-[color:var(--color-success)]"
                          : "size-2 rounded-full bg-[color:var(--color-danger)]"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{w.name}</p>
                      <p className="text-[11px] text-[color:var(--color-fg-subtle)] truncate uppercase tracking-wider">
                        {w.entityType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular font-mono">+{w.new24h}</p>
                      <p className="text-[10.5px] text-[color:var(--color-fg-subtle)] font-mono">
                        new 24h
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Court × NOS heatmap */}
          <section>
            <CourtHeatmap />
          </section>

          {/* Leaderboard */}
          <section>
            <Leaderboard />
          </section>

          {/* Recent activity feed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-2xl tracking-tight">
                  Recent filings
                </h2>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
                  Across all your watchlists. AI summaries on hover.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={"/search" as never}>
                  Search all dockets
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
            <Card className="overflow-hidden">
              <ul>
                {recentEntries.map(({ docket, entry }) => {
                  const Icon = ENTRY_ICON[entry.type] ?? FileText;
                  return (
                    <li
                      key={entry.id}
                      className="group border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors"
                    >
                      <Link
                        href={`/dockets/${docket.id}#${entry.id}` as never}
                        className="block px-5 py-4"
                      >
                        <div className="flex gap-4 items-start">
                          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                            <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                                {docket.court} · {docket.caseNumber}
                              </span>
                              {docket.tags.includes("Hot") && (
                                <Badge variant="danger">Hot</Badge>
                              )}
                              {docket.tags
                                .filter((t) => t !== "Hot")
                                .slice(0, 1)
                                .map((t) => (
                                  <Badge key={t} variant="default">
                                    {t}
                                  </Badge>
                                ))}
                              <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                                {timeAgo(entry.dateFiled)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium truncate">
                              {docket.caseName}
                            </p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                              <span className="text-[color:var(--color-accent)] font-medium">
                                {entry.type}.
                              </span>{" "}
                              {entry.summaryOne ?? entry.short}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
