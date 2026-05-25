import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Bookmark,
  Eye,
  FileText,
  Gavel,
  Scale,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SAMPLE_WATCHLISTS, SAMPLE_DOCKETS } from "@/lib/sample-data";
import { timeAgo } from "@/lib/utils";
import { CopyLinkButton } from "@/components/app/copy-link-button";

/* ============================================================================
 *  /watchlists/[id]/preview — public read-only share page
 *
 *  Owner-shareable URL: "here's what I'm tracking + the latest five
 *  matches." No auth required. Owners toggle visibility from settings
 *  (toggle is a stub today — public by default for demo watchlists).
 *
 *  Designed for Slack/email pastes: the metadata.openGraph block produces
 *  a clean unfurl. Per-page noindex so the public route doesn't leak into
 *  SERPs unless the owner explicitly opts in.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

const ENTRY_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

const TYPE_LABEL: Record<string, string> = {
  party: "Party",
  attorney: "Attorney",
  judge: "Judge",
  lawfirm: "Law firm",
  case: "Case",
  term: "Term search",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const w = SAMPLE_WATCHLISTS.find((x) => x.id === id);
  if (!w) return { title: "Watchlist not found", robots: { index: false } };
  return {
    title: `${w.name} — watchlist preview`,
    description: w.description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${w.name} — DocketLens watchlist`,
      description: w.description,
      url: `${SITE}/watchlists/${w.id}/preview`,
      type: "website",
    },
    alternates: { canonical: `/watchlists/${w.id}/preview` },
  };
}

export default async function WatchlistPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = SAMPLE_WATCHLISTS.find((x) => x.id === id);
  if (!w) notFound();

  // For the demo, pick the 5 newest entries across SAMPLE_DOCKETS and
  // attribute each to the watchlist. Real wire-up reads from
  // `watchlist_matches` for the given watchlist id.
  const matches = SAMPLE_DOCKETS.flatMap((d) =>
    d.entries.map((e) => ({ docket: d, entry: e }))
  )
    .sort(
      (a, b) =>
        new Date(b.entry.dateFiled).getTime() -
        new Date(a.entry.dateFiled).getTime()
    )
    .slice(0, 5);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-12 md:pt-16 pb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              Public preview
            </Badge>
            <Badge variant="outline">{TYPE_LABEL[w.entityType]}</Badge>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
              Read-only · no auth
            </span>
            <CopyLinkButton
              url={`${SITE}/watchlists/${w.id}/preview`}
              title={`${w.name} — DocketLens watchlist`}
            />
          </div>

          <p className="eyebrow mb-3 inline-flex items-center gap-2">
            <Bookmark className="size-3 text-[color:var(--color-accent)]" />
            Watchlist
          </p>
          <h1 className="display-2">{w.name}</h1>
          <p className="mt-4 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            {w.description}
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Total matches</p>
              <p className="font-serif text-3xl tabular leading-none">
                {w.matches}
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">New · 24h</p>
              <p className="font-serif text-3xl tabular leading-none text-[color:var(--color-accent)]">
                +{w.new24h}
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5 col-span-2 sm:col-span-1">
              <p className="eyebrow mb-2">Refreshed</p>
              <p className="font-serif text-3xl tabular leading-none">live</p>
              <p className="mt-2 text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
                next refresh ≤ 60m
              </p>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-12">
          <h2 className="font-serif text-2xl tracking-tight mb-1">
            Latest 5 matches
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            One-line summaries only. Sign in for paragraph + exec briefs.
          </p>
          <Card className="overflow-hidden">
            <ul>
              {matches.map(({ docket, entry }) => {
                const Icon = ENTRY_ICON[entry.type] ?? FileText;
                return (
                  <li
                    key={entry.id}
                    className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-4 flex items-start gap-4"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                      <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                          {docket.court} · {docket.caseNumber}
                        </span>
                        <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                          {timeAgo(entry.dateFiled)}
                        </span>
                      </div>
                      <Link
                        href={`/demo/${docket.id}` as never}
                        className="block mt-1 text-sm font-medium truncate hover:text-[color:var(--color-accent)] transition-colors"
                      >
                        {docket.caseName}
                      </Link>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                        <span className="text-[color:var(--color-accent)] font-medium">
                          {entry.type}.
                        </span>{" "}
                        {entry.summaryOne ?? entry.short}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-6 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h3 className="font-serif text-xl tracking-tight">
                  Want the full feed?
                </h3>
                <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed max-w-xl">
                  Sign up free and you can watch this exact case set with
                  paragraph + executive AI summaries, real-time alerts via
                  email/webhook/Slack, and an RSS feed for any reader.
                </p>
              </div>
              <Button asChild variant="accent">
                <Link href={"/signup" as never}>
                  Start free
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
          </Card>
          <p className="mt-4 font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] text-center">
            This page is shared by the watchlist owner · no tracking on this URL
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function generateStaticParams() {
  return SAMPLE_WATCHLISTS.map((w) => ({ id: w.id }));
}
