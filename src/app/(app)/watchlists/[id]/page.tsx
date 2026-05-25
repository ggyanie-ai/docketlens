import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Pause,
  Share2,
  Trash2,
  Pencil,
  FileText,
  Gavel,
  Scale,
  AlertTriangle,
  Building2,
  Sparkles,
  Users,
  Briefcase,
  Search,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WatchlistEditForm } from "@/components/app/watchlist-edit-form";
import { WatchlistDeleteButton } from "@/components/app/watchlist-delete-button";
import { CopyShareLinkButton } from "@/components/app/copy-share-link-button";
import { WatchlistActivityChart } from "@/components/app/watchlist-activity-chart";
import { SAMPLE_WATCHLISTS, SAMPLE_DOCKETS } from "@/lib/sample-data";
import { timeAgo } from "@/lib/utils";

const TYPE_META: Record<
  string,
  { label: string; icon: typeof Building2; reason: string }
> = {
  party: {
    label: "Party",
    icon: Building2,
    reason: "Party name appears on the docket",
  },
  attorney: {
    label: "Attorney",
    icon: Users,
    reason: "Attorney appears as counsel of record",
  },
  judge: {
    label: "Judge",
    icon: Gavel,
    reason: "Case assigned to this judge",
  },
  lawfirm: {
    label: "Law firm",
    icon: Briefcase,
    reason: "Firm appears as counsel of record",
  },
  case: {
    label: "Case",
    icon: Search,
    reason: "Direct case-number match",
  },
  term: {
    label: "Term search",
    icon: BookOpen,
    reason: "Term appears in filing text",
  },
};

const ENTRY_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

const COLOR_DOT: Record<string, string> = {
  amber: "bg-[color:var(--color-accent)]",
  navy: "bg-[color:var(--color-info)]",
  emerald: "bg-[color:var(--color-success)]",
  rose: "bg-[color:var(--color-danger)]",
};

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const watchlist = SAMPLE_WATCHLISTS.find((w) => w.id === id);
  if (!watchlist) notFound();

  const meta = TYPE_META[watchlist.entityType];

  // Hand-tuned: each demo watchlist gets the most plausible subset of the
  // sample dockets as "matches". When real DB queries land we replace this
  // with `db.select().from(watchlistMatches)…`.
  const MATCH_MAP: Record<string, string[]> = {
    wl_apple: [
      "dkt_optera_v_arm",
      "dkt_ftc_v_aurora",
    ],
    wl_judge_alsup: [
      "dkt_ftc_v_aurora",
      "dkt_optera_v_arm",
      "dkt_helios_v_northgate",
    ],
    wl_kirkland: [
      "dkt_larsen_v_crestmark",
      "dkt_ftc_v_aurora",
      "dkt_helios_v_northgate",
    ],
    wl_securities_sdny: [
      "dkt_larsen_v_crestmark",
      "dkt_sec_v_meridian",
    ],
  };
  const matchedDocketIds =
    MATCH_MAP[watchlist.id] ?? SAMPLE_DOCKETS.slice(0, 3).map((d) => d.id);
  const matchedDockets = matchedDocketIds
    .map((mid) => SAMPLE_DOCKETS.find((d) => d.id === mid))
    .filter((d): d is (typeof SAMPLE_DOCKETS)[number] => Boolean(d));

  const matchEntries = matchedDockets
    .flatMap((d) =>
      d.entries.map((e) => ({
        docket: d,
        entry: e,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.entry.dateFiled).getTime() -
        new Date(a.entry.dateFiled).getTime()
    );

  return (
    <>
      <Topbar title="Watchlist" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href={"/watchlists" as never}
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono mb-6"
          >
            <ArrowLeft className="size-3" />
            All watchlists
          </Link>

          {/* Header */}
          <header className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <span
                className={`size-3 rounded-full mt-2.5 ${
                  COLOR_DOT[watchlist.color] ?? "bg-[color:var(--color-accent)]"
                }`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Badge variant="outline">
                    <meta.icon className="size-3" />
                    {meta.label}
                  </Badge>
                  <Badge variant="success">
                    <CheckCircle2 className="size-3" />
                    Active
                  </Badge>
                </div>
                <h1 className="display-2 leading-none">{watchlist.name}</h1>
                <p className="mt-3 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
                  {watchlist.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline" size="md">
                <Link
                  href={`/watchlists/${watchlist.id}/preview` as never}
                  target="_blank"
                  rel="noopener"
                  title="Open the public read-only share page"
                >
                  <Share2 className="size-4" />
                  Public preview
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
              <CopyShareLinkButton watchlistId={watchlist.id} />
              <Button variant="outline" size="md">
                <Pause className="size-4" />
                Pause
              </Button>
              <WatchlistDeleteButton
                watchlistId={watchlist.id}
                watchlistName={watchlist.name}
              />
              {/* Trash2 import retained for symmetry in the icon set;
                  the actual delete trigger lives inside the new
                  client island. */}
              <span className="hidden" aria-hidden>
                <Trash2 className="size-0" />
              </span>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Tabs */}
            <Tabs defaultValue="matches">
              <TabsList className="mb-6">
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
                    {matchEntries.length} matched filings
                  </p>
                  <p className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
                    Triggered by: <span className="text-[color:var(--color-fg)]">{meta.reason.toLowerCase()}</span>
                  </p>
                </div>
                <Card className="overflow-hidden">
                  <ul>
                    {matchEntries.length === 0 ? (
                      <li className="px-5 py-10 text-center">
                        <p className="text-sm text-[color:var(--color-fg-muted)]">
                          No matches yet. We&apos;ll show them here as new
                          filings come in.
                        </p>
                      </li>
                    ) : (
                      matchEntries.map(({ docket, entry }) => {
                        const Icon = ENTRY_ICON[entry.type] ?? FileText;
                        return (
                          <li
                            key={entry.id}
                            className="border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors"
                          >
                            <Link
                              href={
                                `/dockets/${docket.id}#${entry.id}` as never
                              }
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
                      })
                    )}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="configure">
                <WatchlistEditForm
                  initialName={watchlist.name}
                  initialDescription={watchlist.description}
                  initialEntityType={watchlist.entityType}
                  initialMatchValue={watchlist.name}
                />
              </TabsContent>

              <TabsContent value="activity" className="flex flex-col gap-4">
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        Matches over time
                      </p>
                      <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
                        Trailing 30 days.
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl tabular leading-none">
                        {watchlist.matches}
                      </span>
                      <span className="text-xs text-[color:var(--color-success)] font-mono">
                        +{watchlist.new24h} / 24h
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 -mx-2">
                    <WatchlistActivityChart seed={watchlist.id} />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Right rail */}
            <aside className="flex flex-col gap-6">
              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Sparkles className="inline size-3 mr-1 -translate-y-px" />
                  Stats
                </p>
                <dl className="text-xs flex flex-col gap-2.5">
                  <Stat
                    label="Total matches"
                    value={
                      <span className="font-serif text-2xl tabular leading-none">
                        {watchlist.matches}
                      </span>
                    }
                  />
                  <Stat
                    label="Last 24h"
                    value={
                      <span className="font-serif text-2xl tabular leading-none text-[color:var(--color-accent)]">
                        +{watchlist.new24h}
                      </span>
                    }
                  />
                  <Separator className="my-2" />
                  <Stat label="Cadence" value={<Badge variant="success">Daily</Badge>} />
                  <Stat label="Last run" value={<span className="font-mono">24m ago</span>} />
                  <Stat label="Next run" value={<span className="font-mono">in 36m</span>} />
                </dl>
              </Card>

              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Bell className="inline size-3 mr-1 -translate-y-px" />
                  Channels
                </p>
                <ul className="text-xs flex flex-col gap-2 text-[color:var(--color-fg-muted)]">
                  <li className="flex items-center justify-between">
                    <span>Email digest</span>
                    <Badge variant="success">on</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Slack webhook</span>
                    <Badge variant="default">off</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>In-app inbox</span>
                    <Badge variant="success">on</Badge>
                  </li>
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={"/alerts" as never}>
                    <Pencil className="size-3.5" />
                    Manage channels
                  </Link>
                </Button>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[color:var(--color-fg-muted)] text-[11px] uppercase tracking-wider">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

export function generateStaticParams() {
  return SAMPLE_WATCHLISTS.map((w) => ({ id: w.id }));
}
