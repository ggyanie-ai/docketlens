import Link from "next/link";
import {
  Bell,
  Mail,
  Webhook,
  Inbox,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CHANNELS = [
  {
    icon: Mail,
    name: "Email digest",
    target: "ggyanie.ai@gmail.com",
    cadence: "Daily · 7:00 am · America/Los_Angeles",
    status: "active",
    sentLast30: 28,
  },
  {
    icon: Webhook,
    name: "Slack webhook",
    target: "https://hooks.slack.com/services/T01A…/B02B…/x9k7",
    cadence: "Real-time",
    status: "active",
    sentLast30: 412,
  },
  {
    icon: Inbox,
    name: "In-app inbox",
    target: "All matches",
    cadence: "Real-time",
    status: "active",
    sentLast30: 312,
  },
];

const FEED = [
  {
    id: "d1",
    subject: "Helios Bio v. Northgate — Motion for TRO filed",
    body: "Plaintiff moves for TRO and expedited discovery; hearing requested within 14 days.",
    channel: "Slack webhook",
    when: "13 minutes ago",
    status: "sent" as const,
    watchlist: "Securities — S.D.N.Y.",
  },
  {
    id: "d2",
    subject: "FTC v. Aurora AI — Order setting PI hearing",
    body: "Order setting hearing on plaintiff's motion for preliminary injunction for June 4, 2026 at 10:00 a.m.",
    channel: "In-app inbox",
    when: "47 minutes ago",
    status: "sent" as const,
    watchlist: "Hon. Alsup",
  },
  {
    id: "d3",
    subject: "Optera Semi v. ARM — Order denying motion to dismiss",
    body: "Judge Stark denies ARM's motion to dismiss; §271(a) claims survive; discovery extended 60 days.",
    channel: "Slack webhook",
    when: "2 hours ago",
    status: "sent" as const,
    watchlist: "Kirkland & Ellis",
  },
  {
    id: "d4",
    subject: "Daily digest — 3 new filings across 2 watchlists",
    body: "Larsen v. Crestmark (Putative §10(b) class action), In re Quantix LiDAR (joint case-management plan), …",
    channel: "Email digest",
    when: "Today, 7:00 am",
    status: "sent" as const,
    watchlist: "Securities — S.D.N.Y.",
  },
  {
    id: "d5",
    subject: "Webhook delivery failed (503)",
    body: "Slack returned 503 on retry. Will retry in 5 minutes — exponential backoff active.",
    channel: "Slack webhook",
    when: "5 hours ago",
    status: "failed" as const,
    watchlist: "Apple Inc.",
  },
];

const STATUS_BADGE = {
  sent: { variant: "success" as const, label: "Sent", icon: CheckCircle2 },
  failed: { variant: "danger" as const, label: "Failed", icon: XCircle },
  queued: { variant: "info" as const, label: "Queued", icon: Clock },
};

export default function AlertsPage() {
  return (
    <>
      <Topbar title="Alerts" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
          {/* Channels */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-serif text-2xl tracking-tight">
                  Delivery channels
                </h2>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
                  Where matches get sent. Add Slack, Discord, Linear, or a raw
                  webhook.
                </p>
              </div>
              <Button variant="accent">
                <Bell className="size-4" />
                Add channel
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {CHANNELS.map((c) => (
                <Card key={c.name} className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                      <c.icon className="size-4 text-[color:var(--color-fg-muted)]" />
                    </div>
                    <Badge variant="success">{c.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-[color:var(--color-fg-subtle)] truncate">
                      {c.target}
                    </p>
                  </div>
                  <p className="text-xs text-[color:var(--color-fg-muted)] mt-auto leading-relaxed">
                    {c.cadence}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[color:var(--color-fg-muted)]">
                      Sent 30d
                    </span>
                    <span className="font-mono tabular text-[color:var(--color-fg)]">
                      {c.sentLast30}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Feed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-2xl tracking-tight">
                  Delivery history
                </h2>
                <p className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
                  Last 30 days · click to inspect payload.
                </p>
              </div>
              <div className="flex gap-2">
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                    <TabsTrigger value="failed">Failed</TabsTrigger>
                    <TabsTrigger value="queued">Queued</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Filter className="size-3.5" /> Filter
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <ul>
                {FEED.map((d) => {
                  const s = STATUS_BADGE[d.status];
                  return (
                    <li
                      key={d.id}
                      className="border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors"
                    >
                      <Link
                        href={"/alerts" as never}
                        className="block px-5 py-4"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant={s.variant}>
                            <s.icon className="size-3" />
                            {s.label}
                          </Badge>
                          <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                            {d.channel}
                          </span>
                          <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                            · {d.watchlist}
                          </span>
                          <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                            {d.when}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-snug">
                          {d.subject}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                          {d.body}
                        </p>
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
