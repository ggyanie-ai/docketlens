import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/structured-data";

export const metadata = {
  title: "DocketLens vs Lex Machina",
  description:
    "Honest comparison: Lex Machina is the gold standard for enterprise litigation analytics — at enterprise pricing. DocketLens is the same kind of work done at a price an individual or small firm can actually pay.",
};

/* ============================================================================
 *  /vs/lex-machina — honest comparison with the enterprise incumbent
 *
 *  Tone matters here. Lex Machina is a great product. The pitch is "we're the
 *  affordable option for the 80% of legal professionals who can't justify a
 *  $25k/yr seat" — not "we replace them." Respect the incumbent.
 * ==========================================================================*/

type Cell = string | true | false;

const ROWS: readonly (readonly [string, Cell, Cell, string?])[] = [
  ["Starting price", "≈$25,000 / yr per seat", "$0 free · $49 Pro · $199 Team (5 seats)", "Lex Machina lists no pricing publicly; figure based on widely reported AmLaw 200 contracts."],
  ["How you buy it", "Annual contract, procurement cycle, demo + sales call", "Self-serve checkout, no card on free tier", "Most of the gap isn't features — it's friction."],
  ["Time to first value", "2–6 weeks (onboarding + training)", "Under 5 minutes", "Sign up, create a watchlist, get an alert. That's it."],
  ["Federal court coverage", true, true, "Both have all 94 districts and 13 circuits."],
  ["State court coverage", "Partial — top 50 state courts in select practice areas", false, "We're catching up Q4 2026 with the top 5 states by case volume."],
  ["AI summaries (extractive)", "Limited — case-level narratives", "Three-tier (1-line · paragraph · exec brief) on every filing", "Our AI is the daily-driver feature. Theirs is a value-add."],
  ["Predictive analytics (outcomes / case length / motion grant rates)", true, false, "We don't do this — by design. See our blog post 'We don't predict case outcomes.'"],
  ["Judge / attorney historical performance", true, "Top-line activity only (filings touched, trend deltas)", "Their depth here is unmatched; ours is built for context, not litigation strategy."],
  ["Expert witness database", true, false, "Real gap. Not on our 2026 roadmap."],
  ["Watchlists + alerts", "Yes (per-case)", "Yes — entity-level (party / attorney / judge / firm)", "Our entity resolution is the differentiator."],
  ["Email / Slack / webhook alerts", "Email + custom", "Email + Slack + webhook + in-app", "Native Slack hook is a quality-of-life win."],
  ["Public REST API", "Enterprise tier only", "Team tier — included", "Their API is contract-gated; ours is a checkbox."],
  ["Mobile-first UX", "No", true, "Their interface assumes desktop + a research session."],
  ["Procurement / SOC2 / DPAs", true, "In-progress (SOC2 by Q1 2027)", "If you need SOC2 today, talk to them. We're transparent about timeline."],
  ["Customer success / training", "Dedicated CSM, training sessions", "Email support · priority email on Pro · Slack channel on Team", "Real difference for big-firm users."],
];

const LM_WINS = [
  {
    title: "Predictive analytics nobody else has",
    body:
      "Lex Machina invented this category in legal. Win-rate forecasts, motion grant probabilities by judge, time-to-resolution distributions — they have the longitudinal data and the team. If your litigation strategy turns on probability estimates, this is what you pay for.",
  },
  {
    title: "Expert witness directory + judge depth",
    body:
      "Cross-referenced expert witness reports, judge analytics with decades of priors, attorney win-rate breakdowns. Decades-deep proprietary work. We have none of that today.",
  },
  {
    title: "Enterprise contracts on day one",
    body:
      "SOC2 Type II, custom DPAs, MSA negotiation, dedicated CSM, training. If your procurement team needs the paperwork, this is the path. We're getting there in 2027.",
  },
];

const DL_WINS = [
  {
    title: "Self-serve pricing in the public web",
    body:
      "We list our numbers on /pricing. You can subscribe with a credit card in 90 seconds. No demo, no qualification call, no annual contract.",
  },
  {
    title: "10× lower TCO for solo + small firm",
    body:
      "One Lex Machina seat covers one person. Our $199/mo Team plan covers five. Past five, $25/seat. The math is not subtle.",
  },
  {
    title: "AI summaries on every filing",
    body:
      "Extractive Claude summaries by default at all three tiers. You don't pay extra. We never predict outcomes — that's not the trade-off; it's the explicit design choice.",
  },
  {
    title: "Modern UX",
    body:
      "Dark mode, responsive mobile, keyboard shortcuts, command palette, accessibility audit. Lex Machina's interface optimizes for the seated, two-monitor research session. Ours works on the train.",
  },
  {
    title: "First-class entity watchlists + Slack hook",
    body:
      "Watch a party, a judge, or a law firm, then pipe matches to your team's Slack channel. The integration footprint is small — the time savings aren't.",
  },
];

export default function VsLexMachinaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Comparisons", url: "/comparison" },
          { name: "vs Lex Machina", url: "/vs/lex-machina" },
        ]}
      />
      <ArticleJsonLd
        meta={{
          headline: "DocketLens vs Lex Machina",
          description:
            "Honest comparison: Lex Machina is the gold standard for enterprise litigation analytics at enterprise pricing. DocketLens is the affordable option for the 80% who can't justify a $25k/yr seat.",
          url: "/vs/lex-machina",
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
                Lex Machina.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Lex Machina is a great product — the original legal analytics
              platform, with predictive features nobody else matches.
              It&apos;s also priced for AmLaw 200 firms. DocketLens is the
              same kind of work — federal docket monitoring, AI summaries,
              alerts — at a price an individual or small firm can actually
              pay.
            </p>
            <p className="mt-3 text-sm text-[color:var(--color-fg-subtle)]">
              We aren&apos;t a replacement. We&apos;re the option for the
              95% of legal professionals who can&apos;t justify a $25k seat.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={"/signup" as never}>
                  Try the free tier
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={"/pricing" as never}>See pricing</Link>
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
                  label: "Lex Machina (one seat)",
                  v: "$25k",
                  s: "/ year",
                  note: "Widely-reported AmLaw 200 contract starting point. Often higher.",
                },
                {
                  label: "DocketLens Team",
                  v: "$199",
                  s: "/ month",
                  note: "5 seats included. $25/seat after. ~$2,388/yr for the whole tier.",
                },
                {
                  label: "10-attorney firm savings",
                  v: "$245k",
                  s: "/ year",
                  note: "Lex Machina ×10 vs DocketLens Team + 5 extra seats.",
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

        {/* Feature table */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow mb-3">Feature-by-feature</p>
          <h2 className="font-serif text-3xl tracking-tight mb-2">
            Where we overlap, and where we don&apos;t
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
            We&apos;ve marked Lex Machina&apos;s real strengths honestly.
            If they have it and we don&apos;t, we say so.
          </p>
          <Card className="overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">
                Feature-by-feature comparison of Lex Machina and DocketLens,
                with trade-off commentary per row.
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
                    Lex Machina
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
                {ROWS.map(([feature, lm, dl, note], i) => (
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
                    <CellTd value={lm} />
                    <CellTd value={dl} highlight />
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Lex Machina actually wins */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex items-center gap-2 mb-3">
              <p className="eyebrow">Where Lex Machina actually wins</p>
              <Badge variant="outline">we&apos;re honest</Badge>
            </div>
            <h2 className="font-serif text-3xl tracking-tight mb-2">
              Reasons to pay enterprise prices
            </h2>
            <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
              If any of these are load-bearing for your work, Lex Machina is
              probably worth the spend. Talk to them.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {LM_WINS.map((w) => (
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
            Reasons to pick us
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-8 max-w-2xl">
            Mostly: price, time to value, and product velocity. The list
            below is the version with details.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DL_WINS.map((w) => (
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
              A 10-attorney litigation boutique
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
              Ten attorneys, half of whom need active docket monitoring on
              competitor cases. None of them need predictive analytics for
              the work they actually do.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-4">
                <p className="eyebrow mb-1">Lex Machina</p>
                <p className="font-serif text-3xl tabular leading-none">
                  $250k
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  10 seats × ~$25k. Procurement timeline + annual contract.
                  Onboarding training included.
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/20 p-4">
                <p className="eyebrow mb-1">DocketLens Team</p>
                <p className="font-serif text-3xl tabular leading-none">
                  $4k
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  Team plan $199/mo + 5 extra seats × $25/mo = $324/mo.
                  ≈$3,888/yr. No procurement.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              You save approximately{" "}
              <span className="font-medium text-[color:var(--color-fg)]">
                $246,000 a year
              </span>
              . If even one of those attorneys genuinely needs Lex
              Machina&apos;s predictive analytics, pay for them — and have
              the other nine use us.
            </p>
          </Card>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Most lawyers don&apos;t need enterprise.{" "}
            <span className="italic text-[color:var(--color-accent)]">
              They need affordable.
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="xl">
              <Link href={"/signup" as never}>
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href={"/vs/pacer" as never}>
                <ArrowLeft className="size-4" />
                Or compare to PACER
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-[color:var(--color-fg-subtle)]">
            Trademarks belong to their respective owners. Lex Machina is a
            product of LexisNexis Risk Solutions. We&apos;re not affiliated.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function CellTd({ value, highlight }: { value: Cell; highlight?: boolean }) {
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
      ) : (
        <span className="text-[13px] leading-snug text-[color:var(--color-fg)]">
          {value}
        </span>
      )}
    </td>
  );
}
