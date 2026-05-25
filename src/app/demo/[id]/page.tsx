import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Gavel,
  Scale,
  AlertTriangle,
  Building2,
  Sparkles,
  Users,
  Calendar,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/structured-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const d = SAMPLE_DOCKETS.find((x) => x.id === id);
  if (!d) return { title: "Docket not found" };

  // oEmbed 1.0 discovery — adds two <link rel="alternate"> tags so unfurlers
  // (Notion, Slack, Ghost, WordPress) can find /api/oembed for this docket.
  const docketUrl = `${SITE}/demo/${d.id}`;
  const oembedHref = `${SITE}/api/oembed?url=${encodeURIComponent(docketUrl)}&format=json`;

  const title = `${d.caseNameShort} — ${d.court}`;
  const description = `${d.caseName} — ${d.natureOfSuit}. Filed ${d.filed}.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/demo/${d.id}`,
      types: {
        "application/json+oembed": oembedHref,
      },
    },
    openGraph: {
      title,
      description,
      url: `/demo/${d.id}`,
      type: "article" as const,
    },
  };
}

const ENTRY_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

export default async function DemoDocketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const docket = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!docket) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Demo cases", url: "/demo" },
          { name: docket.caseNameShort, url: `/demo/${docket.id}` },
        ]}
      />
      <ArticleJsonLd
        meta={{
          headline: `${docket.caseName} (${docket.court})`,
          description: `Public-records federal court docket — ${docket.natureOfSuit}, case number ${docket.caseNumber}. ${docket.entries.length} entries timeline-rendered with AI summaries.`,
          url: `/demo/${docket.id}`,
          datePublished: docket.filed,
          dateModified:
            docket.entries
              .map((e) => e.dateFiled)
              .sort()
              .at(-1) ?? docket.filed,
          authorName: "DocketLens",
          section: "Demo docket",
        }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Link
            href={"/demo" as never}
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono mb-6"
          >
            <ArrowLeft className="size-3" />
            All demo cases
          </Link>

          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/20 p-3.5 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm">
              <Sparkles className="inline size-4 -translate-y-px mr-1.5 text-[color:var(--color-accent)]" />
              <span className="font-medium">You&apos;re in the public demo.</span>{" "}
              Watch button, AI summary generator, and export are disabled.
            </p>
            <Button asChild variant="accent" size="sm">
              <Link href={"/signup" as never}>Get the full product</Link>
            </Button>
          </div>

          <header className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="font-mono text-xs text-[color:var(--color-fg-subtle)]">
                {docket.courtFull} · {docket.caseNumber}
              </span>
              <Badge variant="success">{docket.status}</Badge>
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
              <span className="font-mono">{docket.cause}</span>
            </p>
          </header>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <section>
              <h2 className="font-serif text-xl tracking-tight mb-4">
                Docket timeline
              </h2>
              <Card className="overflow-hidden">
                <ol className="relative">
                  {docket.entries
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.dateFiled).getTime() -
                        new Date(a.dateFiled).getTime()
                    )
                    .map((e) => {
                      const Icon = ENTRY_ICON[e.type] ?? FileText;
                      return (
                        <li
                          key={e.id}
                          className="relative pl-12 pr-6 py-5 border-b border-[color:var(--color-border)] last:border-b-0"
                        >
                          <span
                            aria-hidden
                            className="absolute left-7 top-0 bottom-0 w-px bg-[color:var(--color-border)]"
                          />
                          <span className="absolute left-4 top-5 flex size-7 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]">
                            <Icon className="size-3.5 text-[color:var(--color-fg-muted)]" />
                          </span>

                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                              #{e.entryNumber} ·{" "}
                              {new Date(e.dateFiled).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <Badge variant="accent">{e.type}</Badge>
                          </div>
                          <p className="text-base font-medium tracking-tight">
                            {e.short}
                          </p>
                          {e.summaryOne && (
                            <div className="mt-3 rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/30 p-3">
                              <p className="eyebrow mb-1">
                                <Sparkles className="inline size-3 mr-1 -translate-y-px" />
                                AI summary
                              </p>
                              <p className="text-[14px] leading-snug">
                                {e.summaryOne}
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                </ol>
              </Card>
            </section>

            <aside className="flex flex-col gap-6">
              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Users className="inline size-3 mr-1 -translate-y-px" />
                  Parties
                </p>
                <ul className="flex flex-col gap-3">
                  {docket.parties.map((p) => (
                    <li key={p.id}>
                      <p className="text-sm font-medium leading-snug">
                        {p.name}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mt-0.5">
                        {p.role}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <p className="eyebrow mb-3">
                  <Gavel className="inline size-3 mr-1 -translate-y-px" />
                  Judge
                </p>
                <p className="text-sm font-medium">{docket.judge}</p>
                <Separator className="my-4" />
                <p className="eyebrow mb-3">
                  <Calendar className="inline size-3 mr-1 -translate-y-px" />
                  Filed
                </p>
                <p className="font-mono text-xs">
                  {new Date(docket.filed).toLocaleDateString()}
                </p>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
                <p className="eyebrow mb-2">Ready for the real thing?</p>
                <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                  Free tier · 5 watchlists · daily digest · no card needed.
                </p>
                <Button asChild variant="accent" size="sm" className="mt-3 w-full">
                  <Link href={"/signup" as never}>Sign up</Link>
                </Button>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function generateStaticParams() {
  return SAMPLE_DOCKETS.map((d) => ({ id: d.id }));
}
