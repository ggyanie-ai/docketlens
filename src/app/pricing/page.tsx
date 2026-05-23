import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { Faq } from "@/components/marketing/faq";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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

        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
