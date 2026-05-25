import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/structured-data";

export const metadata = {
  title: "DocketLens vs PACER",
  description:
    "Honest comparison: PACER's per-page paywall and 1995 UX versus DocketLens's $0–$49/mo flat pricing, AI summaries, watchlists, and alerts.",
  openGraph: {
    title: "DocketLens vs PACER",
    description:
      "Honest comparison: PACER's per-page paywall and 1995 UX versus DocketLens's flat pricing, AI summaries, watchlists, and alerts.",
    url: "/vs/pacer",
    type: "article" as const,
  },
};

/* ============================================================================
 *  /vs/pacer — honest comparison page
 *
 *  We are explicit about where PACER actually wins (sealed cases, specialty
 *  courts in some edge cases). Without that, this would read as a hit piece —
 *  and lawyers smell that from across the room.
 * ==========================================================================*/

type Cell = string | true | false | { dash: true };

const ROWS: readonly (readonly [string, Cell, Cell, string?])[] = [
  ["Pricing model", "Per-page ($0.10/page, capped $3/doc)", "Flat — Free / $49 / $199 monthly", "Volume usage gets expensive fast on PACER. Flat is the wedge."],
  ["Search", "Per-court boolean strings; no full-text in attachments", "Full-text across cached dockets + parties + judges", "Cross-court search is the everyday quality-of-life win."],
  ["AI summaries", false, "Extractive, three tiers (1-line · paragraph · exec)", "We never predict outcomes. AI restates only what's in the filing."],
  ["Alerts", false, "Email + Slack + webhook + in-app", "PACER has no native alert system. Email digest is our daily-driver feature."],
  ["Watchlists", false, "By party / attorney / judge / law firm / case / term", "First-class entity resolution. Apple = Apple Inc. = APPLE INC."],
  ["Mobile experience", "Functional but not designed for phones", "Responsive, dark mode, keyboard shortcuts", "PACER's interface is a 2001 web form. We're 2026."],
  ["Public REST API", false, true, "JSON, bearer-token auth, documented schemas."],
  ["Coverage — federal district + circuit", true, true, "Both have all 94 districts and 13 circuits."],
  ["Coverage — sealed cases", true, false, "PACER has sealed dockets behind permission walls. RECAP and DocketLens never see them."],
  ["Coverage — specialty courts (Tax, Veterans, ITC)", true, "Partial — varies by court", "PACER is the authoritative source for these."],
  ["Coverage — state courts", false, false, "Neither covers state today. We plan top-5 states in Q4."],
  ["Real-time freshness", "Real-time (it's the source)", "~4 seconds median behind RECAP", "RECAP rides upload events; the gap is usually invisible."],
  ["Bulk download", false, "JSON + CSV export on Team", "RECAP archive has bulk files for backfill if you need it."],
  ["Cost of one busy month (50 lookups, 5 alerts)", "≈$25–$150 in per-page fees + zero alert value", "$0 on Free, $49 on Pro", undefined],
];

const PACER_WINS = [
  {
    title: "It's the authoritative source",
    body:
      "PACER is the official electronic system of record for the federal judiciary. When precision and provenance matter — court filings cited in your own filings — read the PACER copy.",
  },
  {
    title: "Sealed cases are visible (to the right people)",
    body:
      "If you're counsel of record on a sealed case, PACER shows you what you need. RECAP doesn't archive sealed material, and DocketLens by construction can't either.",
  },
  {
    title: "Specialty courts with bespoke filing systems",
    body:
      "Some niche federal courts (Tax Court historically, certain bankruptcy edges) live partially outside the RECAP-mirrored mainstream. PACER reaches them all.",
  },
];

const DOCKETLENS_WINS = [
  {
    title: "Pricing that scales with use, not against it",
    body:
      "Free for 5 watches. Pro at $49/mo for serious solo use. Team at $199/mo for a whole firm. PACER's per-page meter punishes the heavy users it depends on.",
  },
  {
    title: "Cross-court everything",
    body:
      "Search a party name once and see every filing across all 94 districts. PACER makes you search court-by-court. We unify, dedupe, and cluster automatically.",
  },
  {
    title: "AI you can trust because it's extractive",
    body:
      "One-line, paragraph, and exec briefs of every filing — derived from the source text, never predictions or commentary. Every line links back to the source paragraph.",
  },
  {
    title: "Alerts that exist",
    body:
      "Pick a watchlist, pick a channel. Email digest at 7am, Slack hook on every match, raw webhook for your internal stack. PACER has none of this.",
  },
  {
    title: "A product designed in this century",
    body:
      "Dark mode, mobile menu, keyboard shortcuts, command palette, accessibility audit. Reading PACER on a phone is an act of will; DocketLens isn't.",
  },
];

export default function VsPacerPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Comparisons", url: "/comparison" },
          { name: "vs PACER", url: "/vs/pacer" },
        ]}
      />
      <ArticleJsonLd
        meta={{
          headline: "DocketLens vs PACER",
          description:
            "Honest comparison: PACER's per-page paywall and 1995 UX versus DocketLens's flat pricing, AI summaries, watchlists, and alerts.",
          url: "/vs/pacer",
          datePublished: "2026-05-25",
          authorName: "DocketLens",
          section: "Comparison",
        }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade-y opacity-30" />
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-[420px] w-[1000px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
            <p className="eyebrow mb-4">Comparison</p>
            <h1 className="display-1 max-w-4xl">
              DocketLens vs{" "}
              <span className="italic text-[color:var(--color-fg-muted)]">
                PACER.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              PACER is the federal judiciary&apos;s official electronic
              records system — and at $0.10/page with a UI from 2001, it&apos;s
              the most undermonetized public dataset in legal tech.
              DocketLens is the modern alternative built on the public RECAP
              archive. Honest comparison below.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={"/signup" as never}>
                  Try the free tier
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={"/demo" as never}>See the live demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Three-number gist */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              {[
                {
                  label: "PACER per-page fee",
                  v: "$0.10",
                  s: "/ page",
                  note: "Capped $3 / document. No alerts included.",
                },
                {
                  label: "DocketLens Pro",
                  v: "$49",
                  s: "/ month",
                  note: "Unlimited watches, AI summaries, real-time alerts.",
                },
                {
                  label: "Break-even",
                  v: "490",
                  s: "pages / mo",
                  note: "Above this you're losing money on PACER.",
                },
              ].map((s) => (
                <Card
                  key={s.label}
                  className="rounded-none border-0 bg-[color:var(--color-bg)] p-6"
                >
                  <p className="eyebrow">{s.label}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-serif text-5xl tabular leading-none">
                      {s.v}
                    </span>
                    <span className="text-base text-[color:var(--color-fg-muted)] font-mono">
                      {s.s}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-[color:var(--color-fg-subtle)] leading-relaxed">
                    {s.note}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Side-by-side table */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow mb-3">Feature-by-feature</p>
          <h2 className="font-serif text-3xl tracking-tight mb-2">
            What you actually get
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
            Hover any row for the trade-off commentary. Empty cells aren&apos;t
            insults — they reflect real limits of the public RECAP mirror
            that we don&apos;t pretend to overcome.
          </p>
          <Card className="overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">
                Feature-by-feature comparison of PACER and DocketLens, with
                trade-off notes per row.
              </caption>
              <thead>
                <tr className="bg-[color:var(--color-bg-subtle)]/40">
                  <th
                    scope="col"
                    className="text-left px-6 py-4 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium text-center"
                  >
                    PACER
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg)] font-medium text-center bg-[color:var(--color-accent-soft)]/20"
                  >
                    DocketLens
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([feature, pacer, dl, note], i) => (
                  <tr
                    key={feature}
                    className={
                      i % 2 === 0
                        ? "bg-[color:var(--color-bg)]"
                        : "bg-[color:var(--color-bg-subtle)]/30"
                    }
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 text-left text-sm font-medium border-b border-[color:var(--color-border)] align-top"
                    >
                      <div>{feature}</div>
                      {note && (
                        <p className="mt-1 text-[11px] font-normal text-[color:var(--color-fg-subtle)] leading-relaxed max-w-xs">
                          {note}
                        </p>
                      )}
                    </th>
                    <Cell value={pacer} />
                    <Cell value={dl} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* PACER wins */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex items-center gap-2 mb-3">
              <p className="eyebrow">Where PACER actually wins</p>
              <Badge variant="outline">we&apos;re honest</Badge>
            </div>
            <h2 className="font-serif text-3xl tracking-tight mb-2">
              Three things only PACER does
            </h2>
            <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
              We&apos;re not pretending to be a complete replacement. Here are
              the cases where PACER is still the right tool.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {PACER_WINS.map((w) => (
                <Card key={w.title} className="p-6 flex flex-col gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                    <ShieldCheck className="size-4 text-[color:var(--color-fg-muted)]" />
                  </div>
                  <h3 className="font-serif text-lg tracking-tight leading-tight">
                    {w.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                    {w.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* DocketLens wins */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-2 mb-3">
            <p className="eyebrow">Where DocketLens wins</p>
            <Badge variant="accent">five</Badge>
          </div>
          <h2 className="font-serif text-3xl tracking-tight mb-2">
            What you get when you switch
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
            The day-in-day-out wins, not the marketing tagline ones.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCKETLENS_WINS.map((w) => (
              <Card key={w.title} className="p-6 flex flex-col gap-3">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-fg)] dark:text-[color:var(--color-accent)]">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="font-serif text-lg tracking-tight leading-tight">
                  {w.title}
                </h3>
                <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                  {w.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Worked example */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <Card className="p-8 md:p-10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-[color:var(--color-warning)]" />
              <p className="eyebrow">A worked example</p>
            </div>
            <h2 className="font-serif text-2xl tracking-tight">
              A solo attorney tracking five competitor cases
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
              Five active cases. You pull every new filing twice a week to
              stay current — call it forty docket fetches a month, plus an
              occasional 30-page motion download.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-4">
                <p className="eyebrow mb-1">PACER</p>
                <p className="font-serif text-3xl tabular leading-none">
                  $73
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  40 docket reports × ~$0.30 + 6 motions × ~$3 cap + 4 case
                  searches × ~$0.50. No alerts.
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/20 p-4">
                <p className="eyebrow mb-1">DocketLens Pro</p>
                <p className="font-serif text-3xl tabular leading-none">
                  $49
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  Five watchlists, hourly digest, all five cases summarized,
                  no per-fetch math.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              Save $24 a month. Save the hour each week you used to spend
              hitting refresh.
            </p>
          </Card>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Stop paying by the page.{" "}
            <span className="italic text-[color:var(--color-accent)]">
              Start watching what matters.
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="xl">
              <Link href={"/signup" as never}>
                Get early access
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href={"/" as never}>
                <ArrowLeft className="size-4" />
                Back home
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-[color:var(--color-fg-subtle)]">
            Free tier, no card needed. Pro is $49/mo with a 14-day refund
            window. Cancel anytime.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Cell({ value, highlight }: { value: Cell; highlight?: boolean }) {
  return (
    <td
      className={
        "px-6 py-4 text-sm text-center border-b border-[color:var(--color-border)] align-top " +
        (highlight ? "bg-[color:var(--color-accent-soft)]/15" : "")
      }
    >
      {value === true ? (
        <>
          <Check
            aria-hidden
            className={
              "inline size-4 " +
              (highlight
                ? "text-[color:var(--color-accent)]"
                : "text-[color:var(--color-success)]")
            }
          />
          <span className="sr-only">Yes</span>
        </>
      ) : value === false ? (
        <>
          <X
            aria-hidden
            className="inline size-4 text-[color:var(--color-fg-subtle)]"
          />
          <span className="sr-only">No</span>
        </>
      ) : typeof value === "string" ? (
        <span className="text-[13px] leading-snug text-[color:var(--color-fg)]">
          {value}
        </span>
      ) : (
        <span className="text-[color:var(--color-fg-subtle)]">—</span>
      )}
    </td>
  );
}
