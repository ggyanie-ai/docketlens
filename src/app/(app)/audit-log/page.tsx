"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ScrollText,
  LogIn,
  LogOut,
  Bookmark,
  KeyRound,
  Bell,
  CreditCard,
  Database,
  Settings as SettingsIcon,
  ChevronDown,
  Filter,
  Download,
  Search as SearchIcon,
  Lock,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, timeAgo } from "@/lib/utils";
import {
  SAMPLE_AUDIT_EVENTS,
  type AuditCategory,
  type AuditEvent,
} from "@/lib/sample-audit";

/* ============================================================================
 *  /audit-log — admin-only event timeline
 *
 *  Renders a chronological list of every event in `audit_events`. Each row
 *  expands to show metadata + IP/UA detail. Filters by category + free-text
 *  search across actor / target / action.
 * ==========================================================================*/

const CATEGORY_META: Record<
  AuditCategory,
  { label: string; icon: typeof ScrollText; color: string }
> = {
  auth: { label: "Auth", icon: LogIn, color: "info" },
  watchlist: { label: "Watchlist", icon: Bookmark, color: "accent" },
  key: { label: "API key", icon: KeyRound, color: "warning" },
  alert: { label: "Alert", icon: Bell, color: "accent" },
  billing: { label: "Billing", icon: CreditCard, color: "success" },
  data: { label: "Data pipeline", icon: Database, color: "info" },
  settings: { label: "Settings", icon: SettingsIcon, color: "default" },
};

const ACTOR_BADGE: Record<AuditEvent["actor"]["kind"], string> = {
  user: "user",
  api_key: "api key",
  system: "system",
};

type Filter = "all" | AuditCategory;
type DateRange = "24h" | "7d" | "30d" | "all";

const RANGE_MS: Record<DateRange, number | null> = {
  "24h": 86_400_000,
  "7d": 86_400_000 * 7,
  "30d": 86_400_000 * 30,
  all: null,
};

const RANGE_LABEL: Record<DateRange, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export default function AuditLogPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [range, setRange] = useState<DateRange>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const events = useMemo(() => {
    const cutoff = RANGE_MS[range];
    const now = Date.now();
    return SAMPLE_AUDIT_EVENTS.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (cutoff !== null) {
        const occurred = new Date(e.occurredAt).getTime();
        if (now - occurred > cutoff) return false;
      }
      if (q) {
        const hay =
          `${e.action} ${e.actor.name} ${e.actor.detail ?? ""} ${e.target ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    }).sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }, [filter, range, q]);

  // Stats — based on the full set, not the filtered view
  const stats = useMemo(() => {
    const last24 = SAMPLE_AUDIT_EVENTS.filter(
      (e) => Date.now() - new Date(e.occurredAt).getTime() < 86_400_000
    ).length;
    const failed = SAMPLE_AUDIT_EVENTS.filter((e) =>
      e.action.includes("failed")
    ).length;
    const byCat: Record<string, number> = {};
    for (const e of SAMPLE_AUDIT_EVENTS) {
      byCat[e.category] = (byCat[e.category] ?? 0) + 1;
    }
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    return {
      total: SAMPLE_AUDIT_EVENTS.length,
      last24,
      failed,
      topCategory: topCat
        ? { name: CATEGORY_META[topCat[0] as AuditCategory].label, n: topCat[1] }
        : null,
    };
  }, []);

  return (
    <>
      <Topbar title="Audit log" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
          {/* Admin gate notice */}
          <Card className="p-5 flex items-start gap-4 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium tracking-tight inline-flex items-center gap-2">
                Admin-only view
                <Badge variant="accent">restricted</Badge>
              </h2>
              <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 leading-relaxed max-w-2xl">
                Every action that creates, updates, or deletes anything in
                your org lands here. Append-only — entries can&apos;t be
                edited or removed, by you or by us. Exportable for SOC2 and
                compliance reviews.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Total events</p>
              <p className="font-serif text-3xl tabular leading-none">
                {stats.total}
              </p>
              <p className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                all-time
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Last 24h</p>
              <p className="font-serif text-3xl tabular leading-none text-[color:var(--color-accent)]">
                {stats.last24}
              </p>
              <p className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                rolling window
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Failures</p>
              <p
                className={cn(
                  "font-serif text-3xl tabular leading-none",
                  stats.failed > 0 && "text-[color:var(--color-danger)]"
                )}
              >
                {stats.failed}
              </p>
              <p className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                worth a look
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Busiest category</p>
              {stats.topCategory && (
                <>
                  <p className="font-serif text-xl tabular leading-none">
                    {stats.topCategory.name}
                  </p>
                  <p className="mt-2 text-xs font-mono text-[color:var(--color-fg-muted)]">
                    {stats.topCategory.n} events
                  </p>
                </>
              )}
            </Card>
          </div>

          {/* Filter bar */}
          <Card className="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <label htmlFor="audit-q" className="sr-only">
                Filter audit events
              </label>
              <SearchIcon
                aria-hidden
                className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)]"
              />
              <Input
                id="audit-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by actor, action, or target…"
                className="pl-9"
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as Filter)}
            >
              <TabsList className="overflow-x-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                {(Object.keys(CATEGORY_META) as AuditCategory[]).map((c) => (
                  <TabsTrigger key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Card>

          {/* Date-range chip row */}
          <div
            role="radiogroup"
            aria-label="Filter by time range"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mr-1">
              Range
            </span>
            {(Object.keys(RANGE_LABEL) as DateRange[]).map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRange(r)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors",
                    active
                      ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/50 text-[color:var(--color-fg)]"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-fg)]"
                  )}
                >
                  {RANGE_LABEL[r]}
                </button>
              );
            })}
            {(filter !== "all" || range !== "all" || q.trim() !== "") && (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setRange("all");
                  setQ("");
                }}
                className="ml-1 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Timeline */}
          {events.length === 0 ? (
            <Empty
              icon={Filter}
              title="No matching events"
              body="Clear the filter or broaden your search."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul>
                {events.map((e) => {
                  const meta = CATEGORY_META[e.category];
                  const isOpen = expanded === e.id;
                  const failed = e.action.includes("failed");
                  return (
                    <li
                      key={e.id}
                      className="border-b border-[color:var(--color-border)] last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((id) => (id === e.id ? null : e.id))
                        }
                        aria-expanded={isOpen}
                        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors ring-focus"
                      >
                        <div
                          className={cn(
                            "shrink-0 mt-0.5 flex size-9 items-center justify-center rounded-[var(--radius-md)] border",
                            failed
                              ? "bg-[color:var(--color-danger)]/12 text-[color:var(--color-danger)] border-[color:var(--color-danger)]/30"
                              : "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]"
                          )}
                        >
                          <meta.icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="font-mono text-[11.5px] text-[color:var(--color-fg)] tracking-tight">
                              {e.action}
                            </code>
                            <Badge variant="outline" className="text-[10px]">
                              {meta.label}
                            </Badge>
                            <Badge variant="default" className="text-[10px]">
                              {ACTOR_BADGE[e.actor.kind]}
                            </Badge>
                            {failed && (
                              <Badge variant="danger" className="text-[10px]">
                                failed
                              </Badge>
                            )}
                            <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                              {timeAgo(e.occurredAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-snug">
                            <span className="text-[color:var(--color-fg)] font-medium">
                              {e.actor.name}
                            </span>
                            {e.target && (
                              <>
                                {" "}
                                <span className="text-[color:var(--color-fg-muted)]">
                                  →
                                </span>{" "}
                                <span className="text-[color:var(--color-fg)]">
                                  {e.target}
                                </span>
                              </>
                            )}
                          </p>
                          {e.actor.detail && (
                            <p className="mt-0.5 font-mono text-[11px] text-[color:var(--color-fg-subtle)] truncate">
                              {e.actor.detail}
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "mt-2 size-4 shrink-0 text-[color:var(--color-fg-subtle)] transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 -mt-1">
                          <div className="ml-13 grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/50 p-4">
                            <Detail
                              label="Occurred at"
                              value={new Date(e.occurredAt).toLocaleString(
                                "en-US",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "long",
                                }
                              )}
                            />
                            <Detail
                              label="Actor kind"
                              value={ACTOR_BADGE[e.actor.kind]}
                            />
                            {e.ipAddress && (
                              <Detail
                                label="IP address"
                                value={e.ipAddress}
                                mono
                              />
                            )}
                            {e.userAgent && (
                              <Detail label="User agent" value={e.userAgent} />
                            )}
                            {e.metadata && (
                              <div className="sm:col-span-2">
                                <p className="eyebrow mb-1.5">Metadata</p>
                                <pre className="text-[11.5px] font-mono leading-relaxed text-[color:var(--color-fg-muted)] whitespace-pre-wrap break-all">
                                  {JSON.stringify(e.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Retention note */}
          <Card className="p-4 flex items-start gap-3">
            <Lock className="size-4 mt-0.5 text-[color:var(--color-fg-subtle)] shrink-0" />
            <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              Audit events are kept for{" "}
              <span className="text-[color:var(--color-fg)] font-medium">
                7 years
              </span>{" "}
              and exported nightly to cold storage. The Team plan exposes
              this view; Enterprise additionally streams events to your
              SIEM. Read{" "}
              <a
                href="/legal/privacy"
                className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
              >
                Privacy
              </a>{" "}
              for the retention details.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p
        className={cn(
          "text-[12.5px] text-[color:var(--color-fg)]",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Unused import-suppressor for future LogOut wiring on `auth.logout`. */
void LogOut;
