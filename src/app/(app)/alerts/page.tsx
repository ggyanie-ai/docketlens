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
  ArrowRight,
  Eye,
  Sparkles,
  Globe,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendTestWebhookButton } from "@/components/app/send-test-webhook-button";

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

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const sp = await searchParams;
  const isEmpty = sp.empty === "1";

  return (
    <>
      <Topbar title="Alerts" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
          {isEmpty ? <EmptyChannels /> : <PopulatedAlerts />}
        </div>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Populated state                                                            */
/* -------------------------------------------------------------------------- */

function PopulatedAlerts() {
  return (
    <>
      {/* Channels */}
      <section>
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">
              Delivery channels
            </h2>
            <p className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
              Where matches get sent. Add Slack, Discord, Linear, or a raw
              webhook.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link
                href={"/alerts?empty=1" as never}
                title="Preview the empty state"
                className="text-[color:var(--color-fg-subtle)]"
              >
                <Eye className="size-3.5" />
                Preview empty state
              </Link>
            </Button>
            <Button variant="accent">
              <Bell className="size-4" />
              Add channel
            </Button>
          </div>
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
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
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

      <WebhookDeliveries />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Webhook deliveries (read-only, per-channel detail)                         */
/* -------------------------------------------------------------------------- */

interface WebhookRow {
  id: string;
  when: string;
  status: "200" | "204" | "500" | "503" | "timeout";
  latencyMs: number;
  endpoint: string;
  rule: string;
  attempt: number;
}

const WEBHOOK_DELIVERIES: WebhookRow[] = [
  { id: "wh1", when: "2 min ago", status: "200", latencyMs: 184, endpoint: "hooks.slack.com/…/x9k7", rule: "Securities — SDNY", attempt: 1 },
  { id: "wh2", when: "13 min ago", status: "200", latencyMs: 142, endpoint: "hooks.slack.com/…/x9k7", rule: "Hon. Alsup", attempt: 1 },
  { id: "wh3", when: "47 min ago", status: "200", latencyMs: 211, endpoint: "alerts.example.com/intake", rule: "Kirkland & Ellis", attempt: 1 },
  { id: "wh4", when: "2h ago", status: "503", latencyMs: 1840, endpoint: "hooks.slack.com/…/x9k7", rule: "Apple Inc.", attempt: 2 },
  { id: "wh5", when: "2h ago", status: "503", latencyMs: 1602, endpoint: "hooks.slack.com/…/x9k7", rule: "Apple Inc.", attempt: 1 },
  { id: "wh6", when: "5h ago", status: "timeout", latencyMs: 10_000, endpoint: "alerts.example.com/intake", rule: "Securities — SDNY", attempt: 1 },
  { id: "wh7", when: "8h ago", status: "200", latencyMs: 167, endpoint: "hooks.slack.com/…/x9k7", rule: "Hon. Alsup", attempt: 1 },
];

function statusVariant(s: WebhookRow["status"]): "success" | "danger" | "warning" {
  if (s === "200" || s === "204") return "success";
  if (s === "500" || s === "503") return "danger";
  return "warning";
}

function WebhookDeliveries() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">
            Webhook deliveries
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
            Last 30 days of HTTPS POSTs to configured webhook endpoints —
            status, latency, attempt count.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={"/tools/verify-webhook" as never}
              title="Open the in-browser signature verifier"
            >
              <Webhook className="size-3.5" />
              Verify a signature
            </Link>
          </Button>
          <SendTestWebhookButton />
        </div>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Webhook deliveries — last 30 days</caption>
          <thead className="bg-[color:var(--color-bg-subtle)]/40">
            <tr className="text-left">
              <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                Status
              </th>
              <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                Latency
              </th>
              <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                Endpoint
              </th>
              <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                Rule
              </th>
              <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {WEBHOOK_DELIVERIES.map((d) => (
              <tr
                key={d.id}
                className="border-t border-[color:var(--color-border)]/70"
              >
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(d.status)}>
                      {d.status === "timeout" ? "timeout" : `HTTP ${d.status}`}
                    </Badge>
                    {d.attempt > 1 && (
                      <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                        attempt {d.attempt}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                    {d.when}
                  </p>
                </td>
                <td className="px-4 py-3 align-middle font-mono text-[12px] tabular text-[color:var(--color-fg)]">
                  {d.latencyMs.toLocaleString()} ms
                </td>
                <td className="px-4 py-3 align-middle font-mono text-[12px] text-[color:var(--color-fg)] truncate max-w-[260px]">
                  {d.endpoint}
                </td>
                <td className="px-4 py-3 align-middle text-[12.5px] text-[color:var(--color-fg-muted)]">
                  {d.rule}
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Resend the same payload to this endpoint"
                    disabled={statusVariant(d.status) === "success"}
                  >
                    Retry
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        Retries use exponential backoff (1s, 5s, 25s, 125s, give up at 5 attempts).
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                                */
/* -------------------------------------------------------------------------- */

const CHANNEL_OPTIONS = [
  {
    icon: Mail,
    title: "Email digest",
    blurb:
      "A morning summary in your inbox. The lowest-effort way to start — every match shows up at 7 a.m. local.",
    cadence: "Daily or hourly",
    plan: "Free + Pro",
    accent: "amber" as const,
  },
  {
    icon: Webhook,
    title: "Webhook → Slack / Discord / anywhere",
    blurb:
      "Pipe matches as JSON to any HTTPS endpoint. Slack and Discord templates included; signed with HMAC-SHA256.",
    cadence: "Real-time",
    plan: "Pro",
    accent: "info" as const,
  },
  {
    icon: Inbox,
    title: "In-app inbox",
    blurb:
      "Keep alerts inside DocketLens. Combine with email/webhook or use standalone for quiet hours.",
    cadence: "Real-time",
    plan: "All plans",
    accent: "success" as const,
  },
];

const HOW_IT_WORKS = [
  {
    icon: Bell,
    title: "1. Pick a watchlist",
    body: "We already match new filings to your active watchlists. Without channels they queue silently — no spam.",
  },
  {
    icon: Globe,
    title: "2. Choose a channel",
    body: "Email is the safe default. Webhook unlocks Slack/Discord/Linear. In-app is good for batch review.",
  },
  {
    icon: Sparkles,
    title: "3. Wake up smarter",
    body: "Every match comes with the AI one-line summary attached. Click straight through to the docket entry.",
  },
];

function EmptyChannels() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid mask-fade-y opacity-30"
        />
        <Card className="border-dashed bg-[color:var(--color-bg-elevated)]/60 p-10 md:p-14 text-center relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10 h-[260px] w-[640px] rounded-full blur-3xl opacity-25"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="flex justify-center mb-5">
            <span className="relative inline-flex">
              <span
                aria-hidden
                className="motion-safe:animate-ping absolute inset-0 inline-flex rounded-full bg-[color:var(--color-accent)] opacity-40 motion-reduce:hidden"
              />
              <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft">
                <Bell className="size-6" />
              </span>
            </span>
          </div>
          <p className="eyebrow mb-2">No delivery channels yet</p>
          <h2 className="display-2 max-w-2xl mx-auto">
            We&apos;re matching filings to your watchlists,{" "}
            <span className="italic text-[color:var(--color-fg-muted)]">
              but no one&apos;s being told.
            </span>
          </h2>
          <p className="mt-5 text-base text-[color:var(--color-fg-muted)] max-w-xl mx-auto leading-relaxed">
            Add a channel to start receiving alerts. Email is the fastest path
            in — under thirty seconds and no integration setup.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" size="lg">
              <Mail className="size-4" />
              Enable email digest
            </Button>
            <Button variant="outline" size="lg">
              <Webhook className="size-4" />
              Connect a webhook
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href={"/alerts" as never} className="text-[color:var(--color-fg-muted)]">
                Back to current state
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs font-mono text-[color:var(--color-fg-subtle)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[color:var(--color-warning)]" />
              4 watchlists are matching · 12 alerts queued · last 24h
            </span>
          </p>
        </Card>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight mb-1">
          Pick a channel
        </h2>
        <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
          You can wire more than one. Common pattern: email digest for
          the calm cases, Slack for the hot ones.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {CHANNEL_OPTIONS.map((c) => (
            <Card
              key={c.title}
              className="p-6 flex flex-col gap-4 hover:border-[color:var(--color-border-strong)] hover:shadow-soft transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    c.accent === "amber"
                      ? "flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-fg)] dark:text-[color:var(--color-accent)]"
                      : c.accent === "info"
                      ? "flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-info)]/15 text-[color:var(--color-info)]"
                      : "flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]"
                  }
                >
                  <c.icon className="size-5" />
                </div>
                <Badge variant="outline">{c.plan}</Badge>
              </div>
              <div>
                <h3 className="text-base font-medium tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs font-mono uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  {c.cadence}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                {c.blurb}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto justify-between group-hover:border-[color:var(--color-accent)] group-hover:text-[color:var(--color-fg)]"
              >
                Set up
                <ArrowUpRight className="size-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight mb-1">
          How alerts work
        </h2>
        <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
          A 30-second mental model.
        </p>
        <div className="grid md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {HOW_IT_WORKS.map((s) => (
            <Card
              key={s.title}
              className="rounded-none border-0 bg-[color:var(--color-bg)] p-6 flex flex-col gap-4"
            >
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                <s.icon className="size-5 text-[color:var(--color-fg-muted)]" />
              </div>
              <h3 className="text-base font-medium tracking-tight">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                {s.body}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
