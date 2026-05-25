import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { Faq } from "@/components/marketing/faq";
import { Check, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

const PRICING_FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What can I actually do on Free?",
    a: (
      <>
        Five watchlists, one-line AI summaries on every filing, daily email
        digests, and a 7-day window of filing history. Free isn&apos;t a
        teaser — most solo journalists and law students stay on it
        indefinitely. The Pro features (paragraph + exec summaries,
        real-time alerts, webhook delivery, BYO token) are about volume
        and freshness, not access to the data itself.
      </>
    ),
  },
  {
    q: "Can I BYO CourtListener token?",
    a: (
      <>
        Yes — on Pro and Team. Plug in your own CourtListener API token
        and your watchlists hit your own budget (5/min, 50/hr, 125/day)
        instead of competing for the shared pool. This is the single
        biggest lever on freshness. Free uses the shared pool with
        priority-by-cadence (real-time → hourly → daily).
      </>
    ),
  },
  {
    q: "What happens if I hit 50,000 API calls in a day?",
    a: (
      <>
        Team-tier API keys throttle at 50k/day (and 5/sec, 1000/hr — see{" "}
        <Link
          href={"/docs/api-reference" as never}
          className="underline underline-offset-2"
        >
          /docs/api-reference
        </Link>
        ). At the limit you get <code className="font-mono">429</code>{" "}
        responses with <code className="font-mono">Retry-After</code>{" "}
        headers — no surprise overage charges. Need more? Email{" "}
        <a
          href="mailto:support@docketlens.ai"
          className="underline underline-offset-2"
        >
          support@docketlens.ai
        </a>{" "}
        and we&apos;ll raise it.
      </>
    ),
  },
  {
    q: "What counts as a “seat” on Team?",
    a: (
      <>
        A seat is one human with their own login. API keys aren&apos;t
        seats — Team gets unlimited API keys for service-to-service use.
        Watchlists, saved searches, and the audit log are shared org-wide.
        First 5 seats included; $25/seat/month after that, prorated.
      </>
    ),
  },
  {
    q: "Annual discount?",
    a: (
      <>
        Two months free if you pay annually on Pro or Team. The discount
        applies at checkout — you don&apos;t have to ask. We don&apos;t do
        custom enterprise pricing; the published price is the price.
      </>
    ),
  },
  {
    q: "How does cancellation work?",
    a: (
      <>
        Cancel any time in Settings → Billing. You keep Pro/Team features
        through the end of the current period, then drop to Free. Your
        watchlists stay (the extras beyond Free&apos;s 5 are paused, not
        deleted). Re-upgrade to wake them up.
      </>
    ),
  },
  {
    q: "Refund policy?",
    a: (
      <>
        Email us within 30 days of any charge and we&apos;ll refund it,
        no questions asked. Annual plans get a prorated refund based on
        months unused. We&apos;d rather you not pay than feel locked in.
      </>
    ),
  },
  {
    q: "Can I export my data if I leave?",
    a: (
      <>
        Yes — Settings → Export downloads every watchlist (JSON), every
        saved search (JSON), and the last 12 months of alert deliveries
        (CSV). The public REST API is also available on Team if you want
        a programmatic snapshot. We don&apos;t hold data hostage.
      </>
    ),
  },
];

type Cell = string | true | false;
const ROWS: readonly (readonly [string, Cell, Cell, Cell])[] = [
  ["Watchlists", "5", "50", "Unlimited"],
  ["Filing history retention", "7 days", "Unlimited", "Unlimited"],
  ["AI summaries (1-line)", true, true, true],
  ["AI summaries (paragraph)", false, true, true],
  ["AI exec briefs", false, true, true],
  ["Email digest", "Daily", "Real-time + hourly + daily", "Same as Pro"],
  ["Webhook + Slack delivery", false, true, true],
  ["Public REST API", false, false, true],
  ["Seats", "1", "1", "5 (then $25/seat)"],
  ["BYO CourtListener token", false, true, true],
  ["SOC2-ready audit log", false, false, true],
  ["Support", "Community", "Priority email", "Slack channel"],
];

const PLAN_HEADERS = ["Feature", "Free", "Pro", "Team"] as const;

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Pricing</p>
            <h1 className="display-1">
              Three tiers.{" "}
              <span className="italic text-[color:var(--color-fg-muted)]">
                No "contact sales" walls.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
              Free is genuinely usable. Pro replaces the hours you spend on
              PACER. Team replaces a single Bloomberg Law seat — for your whole
              firm.
            </p>
          </div>
        </section>

        <PricingPreview withHeading={false} />

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2
            id="feature-comparison-heading"
            className="font-serif text-2xl tracking-tight mb-8 text-center"
          >
            Compare every feature
          </h2>
          <Card className="overflow-hidden">
            <table
              className="w-full border-collapse"
              aria-labelledby="feature-comparison-heading"
            >
              <caption className="sr-only">
                Side-by-side comparison of DocketLens plans — Free, Pro, and
                Team — across twelve features.
              </caption>
              <thead>
                <tr>
                  {PLAN_HEADERS.map((h, i) => {
                    const isHighlight = h === "Pro";
                    return (
                      <th
                        key={h}
                        scope="col"
                        className={`px-6 py-4 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] border-b border-[color:var(--color-border)] ${
                          i === 0 ? "text-left" : "text-center"
                        } ${isHighlight ? "bg-[color:var(--color-accent-soft)]/20 text-[color:var(--color-fg)]" : ""}`}
                      >
                        {h}
                        {isHighlight && (
                          <span className="sr-only"> (most popular)</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => {
                  const [feature, free, pro, team] = row;
                  const cells: Cell[] = [free, pro, team];
                  const stripe =
                    ri % 2 === 0
                      ? "bg-[color:var(--color-bg)]"
                      : "bg-[color:var(--color-bg-subtle)]/30";
                  return (
                    <tr key={feature} className={stripe}>
                      <th
                        scope="row"
                        className="px-6 py-3 text-left text-sm font-medium border-b border-[color:var(--color-border)]"
                      >
                        {feature}
                      </th>
                      {cells.map((cell, ci) => {
                        const isPro = ci === 1; // 0=Free, 1=Pro, 2=Team
                        return (
                          <td
                            key={ci}
                            className={`px-6 py-3 text-sm border-b border-[color:var(--color-border)] text-center text-[color:var(--color-fg-muted)] ${
                              isPro ? "bg-[color:var(--color-accent-soft)]/15" : ""
                            }`}
                          >
                            {cell === true ? (
                              <>
                                <Check
                                  aria-hidden
                                  className="inline size-4 text-[color:var(--color-accent)]"
                                />
                                <span className="sr-only">Included</span>
                              </>
                            ) : cell === false ? (
                              <>
                                <X
                                  aria-hidden
                                  className="inline size-4 text-[color:var(--color-fg-subtle)]"
                                />
                                <span className="sr-only">Not included</span>
                              </>
                            ) : (
                              cell
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="font-serif text-2xl tracking-tight mb-2 text-center">
            Pricing questions
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] text-center mb-8">
            The questions we get before the questions about the product.
          </p>
          <div className="flex flex-col">
            {PRICING_FAQS.map((f, i) => (
              <details
                key={i}
                className="group border-b border-[color:var(--color-border)] last:border-b-0 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h3 className="text-[15px] font-medium text-[color:var(--color-fg)] leading-snug">
                    {f.q}
                  </h3>
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-[color:var(--color-fg-muted)] transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-3 text-[14.5px] leading-[1.7] text-[color:var(--color-fg-muted)]">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
