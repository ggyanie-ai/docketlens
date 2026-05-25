import Link from "next/link";
import {
  CheckCircle2,
  Globe,
  Database,
  Mail,
  Sparkles,
  Workflow,
  KeyRound,
  Clock,
  Activity,
  ExternalLink,
  Info,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveHealthDot } from "@/components/app/live-health-dot";

export const metadata = {
  title: "Status",
  description:
    "Live operational status of every DocketLens service — web app, REST API, ingest worker, AI summarization, email delivery, and the database.",
};

/* ============================================================================
 *  /status — public status dashboard
 *
 *  Today this renders against synthetic green-state data. Once we wire
 *  metric sources Tuesday (Vercel Analytics, Fly machine health, Anthropic
 *  status webhook, Resend send-failure rate, Neon connection pool, our own
 *  ingest worker heartbeat in audit_events), this page reads from those.
 *  Layout stays the same.
 * ==========================================================================*/

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

interface Service {
  name: string;
  icon: typeof Globe;
  status: ServiceStatus;
  detail: string;
  uptime90: string; // "100.0%" / "99.92%" / etc.
}

const SERVICES: Service[] = [
  {
    name: "Web app",
    icon: Globe,
    status: "operational",
    detail: "Marketing + authed app rendering on Vercel.",
    uptime90: "100.0%",
  },
  {
    name: "REST API v1",
    icon: KeyRound,
    status: "operational",
    detail: "Bearer-token endpoints under /api/v1/*.",
    uptime90: "100.0%",
  },
  {
    name: "Ingest worker",
    icon: Workflow,
    status: "operational",
    detail: "Hourly CourtListener pull → Postgres → match engine.",
    uptime90: "99.94%",
  },
  {
    name: "AI summarization",
    icon: Sparkles,
    status: "operational",
    detail: "Anthropic Claude — Haiku 4.5 + Sonnet 4.6.",
    uptime90: "99.99%",
  },
  {
    name: "Email delivery",
    icon: Mail,
    status: "operational",
    detail: "Resend transactional + digest emails.",
    uptime90: "99.98%",
  },
  {
    name: "Database",
    icon: Database,
    status: "operational",
    detail: "Neon Postgres (US-East primary, pooled).",
    uptime90: "100.0%",
  },
];

const KPIS = [
  {
    label: "Ingest — last run",
    value: "23 m",
    sub: "ago · 47 entries added · 9 matches",
    icon: Clock,
  },
  {
    label: "CourtListener daily quota",
    value: "82 / 125",
    sub: "remaining for our pooled token",
    icon: Activity,
  },
  {
    label: "AI cache hit rate · 24h",
    value: "73 %",
    sub: "across one-liner + paragraph tiers",
    icon: Sparkles,
  },
  {
    label: "Email send-failure rate · 24h",
    value: "0.4 %",
    sub: "well below the 2% page-out threshold",
    icon: Mail,
  },
];

const INCIDENTS = [
  {
    date: "2026-05-23",
    title: "Scheduled maintenance — Neon read-replica failover",
    severity: "info" as const,
    status: "Completed",
    body:
      "Neon promoted a new read replica during the 0200–0210 UTC window. No user-facing impact. Logged for transparency only.",
  },
];

const STATUS_META: Record<
  ServiceStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" }
> = {
  operational: { label: "Operational", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  outage: { label: "Outage", variant: "danger" },
  maintenance: { label: "Maintenance", variant: "info" },
};

function overallStatus(services: Service[]): ServiceStatus {
  if (services.some((s) => s.status === "outage")) return "outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}

export default function StatusPage() {
  const overall = overallStatus(SERVICES);
  const overallMeta = STATUS_META[overall];
  const allGreen = overall === "operational";

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Overall banner */}
        <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-20 pb-8">
          <p className="eyebrow mb-4">Status</p>
          <Card
            className={
              allGreen
                ? "p-8 md:p-10 bg-gradient-to-br from-[color:var(--color-success)]/12 to-transparent border-[color:var(--color-success)]/30"
                : "p-8 md:p-10 bg-gradient-to-br from-[color:var(--color-warning)]/12 to-transparent border-[color:var(--color-warning)]/30"
            }
          >
            <div className="flex items-start gap-5 flex-wrap">
              <div
                className={
                  allGreen
                    ? "flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] shrink-0"
                    : "flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)] shrink-0"
                }
              >
                <CheckCircle2 className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="display-2 leading-none">
                  {allGreen
                    ? "All systems operational."
                    : overallMeta.label + " across the platform."}
                </h1>
                <p className="mt-4 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
                  Six services, six green lights. Last refresh just now.
                  Subscribe to incidents at the bottom of the page or
                  follow{" "}
                  <a
                    href="https://x.com/docketlens"
                    className="text-[color:var(--color-fg)] underline underline-offset-2"
                  >
                    @docketlens
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={overallMeta.variant}>{overallMeta.label}</Badge>
                <LiveHealthDot />
              </div>
            </div>
          </Card>
        </section>

        {/* Services grid */}
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <h2 className="font-serif text-2xl tracking-tight mb-1">Services</h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            Per-service status with rolling 90-day uptime.
          </p>
          <Card className="overflow-hidden">
            <ul>
              {SERVICES.map((s) => {
                const meta = STATUS_META[s.status];
                return (
                  <li
                    key={s.name}
                    className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-4 flex items-center gap-4 flex-wrap"
                  >
                    <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
                      <s.icon className="size-4 text-[color:var(--color-fg-muted)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{s.name}</p>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                        {s.detail}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm tabular text-[color:var(--color-fg)]">
                        {s.uptime90}
                      </p>
                      <p className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] uppercase tracking-wider mt-0.5">
                        90-day uptime
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        {/* KPIs */}
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <h2 className="font-serif text-2xl tracking-tight mb-1">
            Pipeline metrics
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            Numbers we look at every morning — published for transparency.
          </p>
          <div className="grid sm:grid-cols-2 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
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
                <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  {k.sub}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent incidents */}
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <h2 className="font-serif text-2xl tracking-tight mb-1">
            Recent incidents
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            Trailing 30 days. Anything user-facing gets posted here within
            five minutes of detection.
          </p>
          {INCIDENTS.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <CheckCircle2 className="size-6 text-[color:var(--color-success)] mx-auto" />
              <p className="mt-3 text-sm font-medium">No incidents in 30 days</p>
              <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                Quiet runway. We don&apos;t take it for granted.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <ul>
                {INCIDENTS.map((i) => (
                  <li
                    key={i.title}
                    className="px-5 py-4 border-b border-[color:var(--color-border)] last:border-b-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={i.severity}>{i.status}</Badge>
                      <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                        {i.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{i.title}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                      {i.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        {/* Transparency footer */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <Card className="p-6 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Info className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              This page renders synthetic green-state data until Tuesday&apos;s
              wire-up. The metric sources are documented in{" "}
              <Link
                href={"/docs/architecture" as never}
                className="text-[color:var(--color-fg)] underline underline-offset-2"
              >
                docs/ARCHITECTURE.md
              </Link>
              : Vercel Analytics + Fly machine health + Anthropic status +
              Resend send-failure rate + our own ingest heartbeat in{" "}
              <code className="font-mono text-[11px]">audit_events</code>.
              When real signals are wired, this layout stays — only the
              values change.
              <p className="mt-3 inline-flex items-center gap-1 font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                Last refresh: just now
                <ExternalLink className="size-2.5" />
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
