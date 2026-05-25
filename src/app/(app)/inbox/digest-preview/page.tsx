import Link from "next/link";
import { ArrowLeft, Mail, Info } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_DOCKETS, SAMPLE_WATCHLISTS } from "@/lib/sample-data";
import { renderDigestEmail, type DigestItem } from "@/lib/alerts/email";
import type { Docket, DocketEntry, WatchlistMatch } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/* ============================================================================
 *  /inbox/digest-preview
 *
 *  Renders exactly what tomorrow's daily-digest email would look like,
 *  using the live alert-engine `renderDigestEmail()` against synthetic
 *  rows shaped like the real `dockets` + `docket_entries` schema.
 *
 *  Two purposes:
 *   1. Settings → Notifications can preview a real digest before turning
 *      one on — no need to wait until tomorrow morning.
 *   2. Backstop while the live wire-up is pending Tuesday: catches HTML
 *      escaping regressions, layout changes, or font-stack drift.
 *
 *  Synthetic shaping mirrors what alerts/dispatch.ts would assemble per
 *  org: top filings across the calling org's active watchlists, capped
 *  at 5.
 * ==========================================================================*/

function buildItems(): DigestItem[] {
  // Take the 5 newest entries across SAMPLE_DOCKETS, attribute each to a
  // round-robin watchlist so the digest reads as if multiple are firing.
  const all = SAMPLE_DOCKETS.flatMap((d) =>
    d.entries.map((e) => ({ docket: d, entry: e }))
  )
    .sort(
      (a, b) =>
        new Date(b.entry.dateFiled).getTime() -
        new Date(a.entry.dateFiled).getTime()
    )
    .slice(0, 5);

  return all.map(({ docket, entry }, i): DigestItem => {
    const w = SAMPLE_WATCHLISTS[i % SAMPLE_WATCHLISTS.length];
    const docketShape: Docket = {
      id: docket.id,
      clId: null,
      court: docket.court,
      caseName: docket.caseName,
      caseNameShort: docket.caseNameShort,
      docketNumber: docket.caseNumber,
      natureOfSuit: docket.natureOfSuit,
      cause: docket.cause,
      juryDemand: docket.juryDemand,
      assignedTo: docket.judge,
      referredTo: docket.referredJudge ?? null,
      dateFiled: new Date(docket.filed),
      dateTerminated: null,
      filed: new Date(docket.filed),
      sourceUrl: null,
      createdAt: new Date(docket.filed),
      updatedAt: new Date(docket.filed),
    } as unknown as Docket;
    const entryShape: DocketEntry = {
      id: entry.id,
      docketId: docket.id,
      clId: null,
      entryNumber: entry.entryNumber,
      dateFiled: new Date(entry.dateFiled),
      shortDescription: entry.short,
      description: entry.description,
      filedBy: entry.filedBy ?? null,
      docUrl: null,
      docLocalPath: null,
      pageCount: null,
      sealed: false,
      ingestedAt: new Date(entry.dateFiled),
      createdAt: new Date(entry.dateFiled),
      updatedAt: new Date(entry.dateFiled),
    } as unknown as DocketEntry;
    const matchShape: WatchlistMatch = {
      id: `wm_preview_${i}`,
      watchlistId: w.id,
      docketId: docket.id,
      entryId: entry.id,
      orgId: "org_preview",
      matchedAt: new Date(entry.dateFiled),
      reason: `${w.entityType} match (preview)`,
      score: 0.9,
      createdAt: new Date(entry.dateFiled),
    } as unknown as WatchlistMatch;
    return { docket: docketShape, entry: entryShape, match: matchShape };
  });
}

export default function DigestPreviewPage() {
  const items = buildItems();
  const { subject, html } = renderDigestEmail({ cadence: "daily", items });

  return (
    <>
      <Topbar title="Daily digest preview" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-6">
          <div>
            <Link
              href={"/inbox" as never}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono mb-3"
            >
              <ArrowLeft className="size-3" />
              Inbox
            </Link>
            <p className="eyebrow mb-3 inline-flex items-center gap-2">
              <Mail className="size-3 text-[color:var(--color-accent)]" />
              Tomorrow&apos;s email
            </p>
            <h1 className="display-2">Daily digest preview.</h1>
            <p className="mt-4 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Exactly what your 7:00 am digest will look like — same
              renderer, same HTML, same sender. Useful before you turn
              the email channel on for the first time.
            </p>
          </div>

          <Card className="p-4 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Info className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              <p className="text-[color:var(--color-fg)] font-medium">
                Sample data
              </p>
              <p className="mt-1">
                Built from <code className="font-mono">SAMPLE_DOCKETS</code>{" "}
                and the four watchlists shown on /dashboard. The live
                digest will replace these with real matches from your
                watchlists when the email channel is on.
              </p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">Subject</p>
              <p className="font-mono text-[13px] text-[color:var(--color-fg)] leading-snug">
                {subject}
              </p>
            </Card>
            <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
              <p className="eyebrow mb-2">From / To</p>
              <p className="font-mono text-[12px] text-[color:var(--color-fg-muted)] leading-snug">
                DocketLens &lt;alerts@docketlens.ai&gt;
              </p>
              <p className="font-mono text-[12px] text-[color:var(--color-fg-muted)] leading-snug mt-0.5">
                you@yourdomain.com
              </p>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden bg-[color:var(--color-bg-elevated)]">
            <div className="border-b border-[color:var(--color-border)] px-4 py-2 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Rendered HTML
              </Badge>
              <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] uppercase tracking-wider">
                isolated inside iframe — no JS, no images
              </span>
            </div>
            <iframe
              srcDoc={html}
              title="Daily digest preview"
              sandbox=""
              style={{
                display: "block",
                width: "100%",
                height: 720,
                border: 0,
                background: "transparent",
              }}
            />
          </Card>
        </div>
      </main>
    </>
  );
}
