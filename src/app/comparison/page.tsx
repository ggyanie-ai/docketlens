import Link from "next/link";
import { ArrowRight, ArrowUpRight, Scale, Clock, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export const metadata = {
  title: "Comparisons",
  description:
    "How DocketLens compares to PACER, Lex Machina, and the rest of the federal court-data tooling landscape.",
  openGraph: {
    title: "DocketLens comparisons",
    description:
      "How DocketLens compares to PACER, Lex Machina, and the rest of the federal court-data tooling landscape.",
    url: "/comparison",
    type: "website" as const,
  },
};

interface Comparison {
  slug: string;
  target: string;
  category: string;
  positioning: string;
  pricingHeadline: string;
  href: string;
  shipped: boolean;
}

const COMPARISONS: Comparison[] = [
  {
    slug: "pacer",
    target: "PACER",
    category: "Source of record",
    positioning:
      "The federal judiciary's own electronic records system — public but per-page priced and built in 2001. We sit on top of the public mirror at a flat price with AI and alerts.",
    pricingHeadline: "$0.10 / page → $49 / month flat",
    href: "/vs/pacer",
    shipped: true,
  },
  {
    slug: "lex-machina",
    target: "Lex Machina",
    category: "Enterprise legal analytics",
    positioning:
      "The original litigation-analytics platform with predictive features nobody else matches. We're the affordable option for the 95% who can't justify a $25k/yr seat.",
    pricingHeadline: "≈$25,000 / yr → $199 / month",
    href: "/vs/lex-machina",
    shipped: true,
  },
];

const PLANNED: { target: string; category: string; eta: string }[] = [
  {
    target: "Bloomberg Law",
    category: "Enterprise legal research",
    eta: "Q3",
  },
  {
    target: "Docket Navigator",
    category: "IP-litigation specialist",
    eta: "Q3",
  },
  {
    target: "CourtListener",
    category: "Free public archive",
    eta: "Q3",
  },
  {
    target: "Westlaw Edge",
    category: "Legacy research + analytics",
    eta: "Q4",
  },
];

export default function ComparisonIndexPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DocketLens comparisons",
    description:
      "How DocketLens compares to PACER, Lex Machina, and the rest of the federal court-data tooling landscape.",
    url: `${SITE}/comparison`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "DocketLens",
      url: SITE,
    },
    hasPart: COMPARISONS.map((c) => ({
      "@type": "Article",
      headline: `DocketLens vs. ${c.target}`,
      url: `${SITE}${c.href}`,
      about: c.target,
      articleSection: c.category,
      description: c.positioning,
    })),
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: COMPARISONS.length,
      itemListElement: COMPARISONS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `DocketLens vs. ${c.target}`,
        url: `${SITE}${c.href}`,
      })),
    },
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Comparisons", url: "/comparison" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
          <p className="eyebrow mb-4">Comparisons</p>
          <h1 className="display-1 max-w-4xl">
            How DocketLens stacks up against{" "}
            <span className="italic text-[color:var(--color-fg-muted)]">
              everything else.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Each comparison is written honestly — we name what the
            incumbents do better than us before we name what we do better
            than them. If you&apos;re shopping for a federal-docket tool,
            these pages should make the trade-offs explicit.
          </p>
        </section>

        {/* Shipped comparisons */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-serif text-2xl tracking-tight">
              In-depth comparisons
            </h2>
            <Badge variant="accent">
              {COMPARISONS.length} shipped
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {COMPARISONS.map((c) => (
              <Link key={c.slug} href={c.href as never} className="group block">
                <Card className="p-7 h-full hover:border-[color:var(--color-border-strong)] hover:shadow-soft transition-all flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                      <Scale className="size-5 text-[color:var(--color-fg-muted)]" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {c.category}
                    </Badge>
                  </div>

                  <div>
                    <p className="eyebrow mb-2">DocketLens vs</p>
                    <h3 className="font-serif text-2xl md:text-3xl tracking-tight leading-tight">
                      {c.target}
                    </h3>
                  </div>

                  <p className="text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
                    {c.positioning}
                  </p>

                  <div className="rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/20 p-3 mt-auto">
                    <p className="eyebrow mb-1">Pricing wedge</p>
                    <p className="font-mono text-[13px] tabular text-[color:var(--color-fg)]">
                      {c.pricingHeadline}
                    </p>
                  </div>

                  <p className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors inline-flex items-center gap-1">
                    Read the comparison
                    <ArrowUpRight className="size-3" />
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-serif text-2xl tracking-tight">Coming next</h2>
            <Badge variant="outline">{PLANNED.length} planned</Badge>
          </div>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6 max-w-2xl">
            We&apos;ll publish these as we get to them. If there&apos;s one
            you want sooner, ping us — direct feedback bumps the order.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLANNED.map((p) => (
              <Card
                key={p.target}
                className="p-5 flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                  <Clock className="size-4 text-[color:var(--color-fg-subtle)]" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {p.target}
                  </p>
                  <p className="mt-1 text-[11px] text-[color:var(--color-fg-subtle)] uppercase tracking-wider">
                    {p.category}
                  </p>
                </div>
                <Badge variant="default" className="self-start text-[10px]">
                  Q4 2026 · {p.eta}
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* House style note */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <Card className="p-6 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Sparkles className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-[13px] text-[color:var(--color-fg-muted)] leading-relaxed">
              <p className="font-medium text-[color:var(--color-fg)]">
                Our comparison house style
              </p>
              <p className="mt-2">
                Every page leads with what the competitor genuinely does
                better than us. Then a feature-by-feature table with
                trade-off notes per row. Then a worked example doing the
                math for a representative customer. We&apos;d rather lose
                a sale to a better-fit tool than win one we can&apos;t
                serve well.
              </p>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Already convinced?{" "}
            <span className="italic text-[color:var(--color-accent)]">
              Skip the comparisons.
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
              <Link href={"/pricing" as never}>See pricing</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
