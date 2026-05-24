import Link from "next/link";
import { Mail, Webhook, Inbox, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  renderDigestEmail,
  type DigestItem,
} from "@/lib/alerts/email";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import type {
  Docket,
  DocketEntry,
  WatchlistMatch,
} from "@/lib/db/schema";

/* ============================================================================
 *  /email-preview — internal dev tool
 *
 *  Renders renderDigestEmail() against synthetic match items so the operator
 *  can review the daily digest template without firing a real send.
 *  Cadence is a `?cadence=` searchParam so each variant is server-rendered.
 *
 *  Linked from the README + DEPLOY runbook but not from the public footer —
 *  this isn't really a marketing surface.
 * ==========================================================================*/

export const metadata = {
  title: "Email preview",
  robots: { index: false, follow: false },
};

const CADENCES = ["instant", "hourly", "daily"] as const;
type Cadence = (typeof CADENCES)[number];

function asDocketRow(d: (typeof SAMPLE_DOCKETS)[number]): Docket {
  // Map the SampleDocket shape to the Drizzle `dockets` row shape the email
  // renderer expects. We only populate what renderDigestEmail reads.
  return {
    id: d.id,
    clId: 0,
    court: d.court,
    caseName: d.caseName,
    caseNameShort: d.caseNameShort,
    docketNumber: d.caseNumber,
    pacerCaseId: null,
    natureOfSuit: d.natureOfSuit,
    cause: d.cause,
    juryDemand: d.juryDemand,
    dateFiled: new Date(d.filed),
    dateTerminated: null,
    dateLastFiling: new Date(d.entries[d.entries.length - 1]?.dateFiled ?? d.filed),
    assignedTo: d.judge,
    referredTo: d.referredJudge ?? null,
    appellateCaseTypeInformation: null,
    sourceCount: 0,
    raw: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function asEntryRow(
  d: (typeof SAMPLE_DOCKETS)[number],
  e: (typeof SAMPLE_DOCKETS)[number]["entries"][number]
): DocketEntry {
  return {
    id: e.id,
    clId: 0,
    docketId: d.id,
    entryNumber: e.entryNumber,
    dateFiled: new Date(e.dateFiled),
    description: e.description,
    shortDescription: e.short,
    documentNumber: null,
    raw: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function asMatchRow(d: (typeof SAMPLE_DOCKETS)[number], entryId: string): WatchlistMatch {
  return {
    id: `mat_${d.id}_${entryId}`,
    watchlistId: "wl_demo",
    docketId: d.id,
    entryId,
    matchedAt: new Date(),
    matchReason: "demo",
    score: 0.95,
  };
}

function buildDigestItems(cadence: Cadence): DigestItem[] {
  // instant = 1 item, hourly = 3, daily = all entries across all dockets
  const slice =
    cadence === "instant"
      ? SAMPLE_DOCKETS.slice(0, 1)
      : cadence === "hourly"
      ? SAMPLE_DOCKETS.slice(0, 3)
      : SAMPLE_DOCKETS;

  return slice.flatMap((d) =>
    d.entries.map((e) => ({
      docket: asDocketRow(d),
      entry: asEntryRow(d, e),
      match: asMatchRow(d, e.id),
    }))
  );
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ cadence?: string }>;
}) {
  const sp = await searchParams;
  const cadence: Cadence =
    sp.cadence === "instant" || sp.cadence === "hourly"
      ? sp.cadence
      : "daily";

  const items = buildDigestItems(cadence);
  const rendered = renderDigestEmail({ cadence, items });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-12 md:pt-16 pb-6">
          <Link
            href={"/" as never}
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono mb-6"
          >
            <ArrowLeft className="size-3" />
            Home
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">internal dev tool</Badge>
            <Badge variant="default">noindex</Badge>
          </div>
          <h1 className="display-2">Digest email preview</h1>
          <p className="mt-4 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Renders <code className="font-mono text-xs">renderDigestEmail()</code>{" "}
            against synthetic match items so we can review the template without
            firing a real send. Pick a cadence below.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="eyebrow mr-1">Cadence</span>
            {CADENCES.map((c) => {
              const active = cadence === c;
              const Icon =
                c === "instant" ? Webhook : c === "hourly" ? Inbox : Mail;
              return (
                <Link
                  key={c}
                  href={`/email-preview?cadence=${c}` as never}
                  className={
                    active
                      ? "inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border-transparent"
                      : "inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-fg)] transition-colors"
                  }
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-3.5" />
                  {c}
                </Link>
              );
            })}
            <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)] tabular">
              {items.length} matched filings · {rendered.body.length} chars (plain)
            </span>
          </div>
        </section>

        {/* Subject */}
        <section className="mx-auto max-w-5xl px-6 pb-6">
          <Card className="p-5">
            <p className="eyebrow mb-2">Subject line</p>
            <p className="font-serif text-xl tracking-tight leading-tight">
              {rendered.subject}
            </p>
          </Card>
        </section>

        {/* Side-by-side */}
        <section className="mx-auto max-w-7xl px-6 pb-20 grid lg:grid-cols-2 gap-6">
          {/* Plaintext */}
          <Card className="overflow-hidden">
            <header className="px-5 py-3 border-b border-[color:var(--color-border)] flex items-center justify-between">
              <p className="text-sm font-medium">Plain text</p>
              <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                text/plain · {rendered.body.split("\n").length} lines
              </span>
            </header>
            <pre className="text-[12.5px] font-mono leading-[1.65] text-[color:var(--color-fg)] p-5 whitespace-pre-wrap break-words overflow-x-auto">
              {rendered.body}
            </pre>
          </Card>

          {/* HTML */}
          <Card className="overflow-hidden">
            <header className="px-5 py-3 border-b border-[color:var(--color-border)] flex items-center justify-between">
              <p className="text-sm font-medium">HTML</p>
              <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                text/html · sandboxed iframe at 600px
              </span>
            </header>
            <div className="bg-[color:var(--color-bg-subtle)] p-3">
              <div className="mx-auto" style={{ maxWidth: 600 }}>
                {/* sandbox isolates the email styles from the host page */}
                <iframe
                  title="Digest email HTML preview"
                  srcDoc={rendered.html}
                  className="block w-full border border-[color:var(--color-border)] rounded-[var(--radius-md)] bg-white"
                  style={{ height: 640 }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <Card className="p-5 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Mail className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              Renderer lives in{" "}
              <code className="font-mono text-[11px] text-[color:var(--color-fg)]">
                src/lib/alerts/email.ts
              </code>
              . When Resend is wired Tuesday, the same payload routes through{" "}
              <code className="font-mono text-[11px] text-[color:var(--color-fg)]">
                src/lib/alerts/dispatch.ts
              </code>{" "}
              → Resend SDK with no template change.
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
