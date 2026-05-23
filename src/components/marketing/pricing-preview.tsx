import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const PLANS = [
  {
    name: "Free",
    price: 0,
    cadence: "forever",
    blurb: "For watching a handful of cases.",
    cta: "Start free",
    href: "/signup",
    highlight: false,
    features: [
      "5 watchlists",
      "7-day filing history",
      "Daily email digest",
      "Basic AI summaries (1-line)",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: 49,
    cadence: "/ month",
    blurb: "For attorneys, journalists, and analysts.",
    cta: "Upgrade to Pro",
    href: "/signup?plan=pro",
    highlight: true,
    features: [
      "50 watchlists",
      "Unlimited filing history",
      "Real-time + hourly alerts",
      "Full AI summaries (1-line, paragraph, exec)",
      "Case timeline + graph",
      "BYO CourtListener token",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: 199,
    cadence: "/ month",
    blurb: "For firms, newsrooms, and investment teams.",
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
    features: [
      "Everything in Pro",
      "5 seats included ($25/seat after)",
      "Shared watchlists + comments",
      "REST API access",
      "Slack + webhook integrations",
      "SOC2-ready audit log",
      "Dedicated Slack channel",
    ],
  },
];

export function PricingPreview({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        {withHeading && (
          <div className="max-w-2xl mb-14">
            <p className="eyebrow mb-4">Pricing</p>
            <h2 className="display-2">
              Honest pricing. <span className="italic text-[color:var(--color-fg-muted)]">No "contact sales" walls.</span>
            </h2>
            <p className="mt-5 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
              Free tier covers what you'd actually try first. Pro replaces the monthly
              hours you spend on PACER. Team is what a single Bloomberg Law seat would
              cost — for your whole firm.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <Card
              key={p.name}
              className={`p-8 flex flex-col gap-6 relative ${
                p.highlight
                  ? "border-[color:var(--color-accent)] shadow-soft ring-1 ring-[color:var(--color-accent)]"
                  : ""
              }`}
            >
              {p.highlight && (
                <Badge variant="accent" className="absolute -top-3 left-8">
                  Most popular
                </Badge>
              )}
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl tracking-tight">{p.name}</h3>
                <p className="text-sm text-[color:var(--color-fg-muted)]">
                  {p.blurb}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-5xl tabular leading-none">
                  ${p.price}
                </span>
                <span className="text-sm text-[color:var(--color-fg-muted)] font-mono">
                  {p.cadence}
                </span>
              </div>
              <ul className="flex flex-col gap-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
                    <span className="text-[color:var(--color-fg-muted)]">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.highlight ? "accent" : "outline"}
                size="lg"
                className="mt-auto"
              >
                <Link href={p.href as never}>{p.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
