import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookmarkPlus,
  Share2,
  Download,
  FileText,
  Gavel,
  Scale,
  AlertTriangle,
  Building2,
  Sparkles,
  Users,
  Calendar,
  Bell,
} from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiExecSummaryCard } from "@/components/app/ai-exec-summary-card";
import { SAMPLE_DOCKETS, type SampleDocket } from "@/lib/sample-data";

const ENTRY_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

export default async function DocketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const docket: SampleDocket | undefined = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!docket) notFound();

  const hasOpen = docket.status === "Open";

  return (
    <>
      <Topbar title="Case" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-6">
            <Link
              href={"/search" as never}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono"
            >
              <ArrowLeft className="size-3" />
              Back to search
            </Link>
          </div>

          {/* Case header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="font-mono text-xs text-[color:var(--color-fg-subtle)]">
                {docket.courtFull} · {docket.caseNumber}
              </span>
              <Badge variant={hasOpen ? "success" : "default"}>
                {docket.status}
              </Badge>
              {docket.tags.map((t) => (
                <Badge
                  key={t}
                  variant={
                    t === "Hot"
                      ? "danger"
                      : t === "Patent"
                      ? "accent"
                      : t === "Securities"
                      ? "warning"
                      : t === "Antitrust"
                      ? "info"
                      : "default"
                  }
                >
                  {t}
                </Badge>
              ))}
            </div>
            <h1 className="display-2 mb-2">{docket.caseName}</h1>
            <p className="text-base text-[color:var(--color-fg-muted)] leading-relaxed">
              {docket.natureOfSuit} ·{" "}
              <span className="font-mono">{docket.cause}</span> · Jury demand:{" "}
              <span className="text-[color:var(--color-fg)]">
                {docket.juryDemand}
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="accent" size="md">
                <Bell className="size-4" />
                Watch this case
              </Button>
              <Button variant="outline" size="md">
                <BookmarkPlus className="size-4" />
                Save to list
              </Button>
              <Button asChild variant="outline" size="md">
                <a href="#ai-exec-card">
                  <Sparkles className="size-4" />
                  AI exec summary
                </a>
              </Button>
              <Button variant="outline" size="md">
                <Share2 className="size-4" />
                Share
              </Button>
              <Button variant="outline" size="md">
                <Download className="size-4" />
                Export PDF
              </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Timeline */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl tracking-tight">
                  Docket timeline
                </h2>
                <p className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
                  {docket.entries.length} entries
                </p>
              </div>

              <Card className="overflow-hidden">
                <ol className="relative">
                  {docket.entries
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.dateFiled).getTime() -
                        new Date(a.dateFiled).getTime()
                    )
                    .map((e, i, arr) => {
                      const Icon = ENTRY_ICON[e.type] ?? FileText;
                      return (
                        <li
                          key={e.id}
                          id={e.id}
                          className="relative pl-12 pr-6 py-5 border-b border-[color:var(--color-border)] last:border-b-0 scroll-mt-24"
                        >
                          {/* spine */}
                          <span
                            aria-hidden
                            className="absolute left-7 top-0 bottom-0 w-px bg-[color:var(--color-border)]"
                            style={i === arr.length - 1 ? { bottom: "50%" } : undefined}
                          />
                          {i === 0 && (
                            <span
                              aria-hidden
                              className="absolute left-7 top-0 h-5 w-px bg-transparent"
                            />
                          )}
                          <span className="absolute left-4 top-5 flex size-7 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]">
                            <Icon className="size-3.5 text-[color:var(--color-fg-muted)]" />
                          </span>

                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                              #{e.entryNumber} ·{" "}
                              {new Date(e.dateFiled).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <Badge variant="accent">{e.type}</Badge>
                            {e.filedBy && (
                              <Badge variant="outline">{e.filedBy}</Badge>
                            )}
                          </div>
                          <p className="text-base font-medium tracking-tight">
                            {e.short}
                          </p>
                          {e.summaryOne && (
                            <div className="mt-3 rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/30 p-3">
                              <p className="eyebrow mb-1">
                                <Sparkles className="inline size-3 mr-1 -translate-y-px" />
                                One-line summary
                              </p>
                              <p className="text-[14px] leading-snug text-[color:var(--color-fg)]">
                                {e.summaryOne}
                              </p>
                            </div>
                          )}
                          {e.summaryPara && (
                            <details className="mt-3 group">
                              <summary className="text-xs text-[color:var(--color-fg-muted)] cursor-pointer hover:text-[color:var(--color-fg)] inline-flex items-center gap-1">
                                <Sparkles className="size-3" />
                                Paragraph summary
                              </summary>
                              <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-fg-muted)]">
                                {e.summaryPara}
                              </p>
                            </details>
                          )}
                          <details className="mt-3 group">
                            <summary className="text-xs text-[color:var(--color-fg-muted)] cursor-pointer hover:text-[color:var(--color-fg)]">
                              View full docket text
                            </summary>
                            <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-fg-muted)] font-serif">
                              {e.description}
                            </p>
                          </details>
                        </li>
                      );
                    })}
                </ol>
              </Card>
            </section>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6">
              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Users className="inline size-3 mr-1 -translate-y-px" />
                  Parties
                </p>
                <ul className="flex flex-col gap-3">
                  {docket.parties.map((p) => (
                    <li key={p.id}>
                      <p className="text-sm font-medium leading-snug">{p.name}</p>
                      <p className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mt-0.5">
                        {p.role}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--color-fg-muted)] leading-snug">
                        {p.counsel.join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Gavel className="inline size-3 mr-1 -translate-y-px" />
                  Judges
                </p>
                <p className="text-sm font-medium">{docket.judge}</p>
                {docket.referredJudge && (
                  <p className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                    Referred to: {docket.referredJudge}
                  </p>
                )}
                <Separator className="my-4" />
                <p className="eyebrow mb-3">
                  <Calendar className="inline size-3 mr-1 -translate-y-px" />
                  Key dates
                </p>
                <dl className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--color-fg-muted)]">Filed</dt>
                    <dd className="font-mono">
                      {new Date(docket.filed).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--color-fg-muted)]">
                      Last entry
                    </dt>
                    <dd className="font-mono">
                      {new Date(
                        docket.entries[docket.entries.length - 1]?.dateFiled ??
                          docket.filed
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--color-fg-muted)]">Status</dt>
                    <dd className="font-medium">{docket.status}</dd>
                  </div>
                </dl>
              </Card>

              <AiExecSummaryCard
                caseName={docket.caseName}
                court={docket.courtFull}
                caseNumber={docket.caseNumber}
                natureOfSuit={docket.natureOfSuit}
                juryDemand={docket.juryDemand}
                judge={docket.judge}
                parties={docket.parties.map((p) => ({ name: p.name, role: p.role }))}
                lastEntry={
                  docket.entries[docket.entries.length - 1]
                    ? {
                        type: docket.entries[docket.entries.length - 1].type,
                        short: docket.entries[docket.entries.length - 1].short,
                        dateFiled:
                          docket.entries[docket.entries.length - 1].dateFiled,
                      }
                    : undefined
                }
              />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export function generateStaticParams() {
  return SAMPLE_DOCKETS.map((d) => ({ id: d.id }));
}
