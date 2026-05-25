import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { Stats } from "@/components/marketing/stats";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCases } from "@/components/marketing/use-cases";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";

const SITE = "https://docketlens.ai";

/* ============================================================================
 *  schema.org SoftwareApplication JSON-LD
 *
 *  Companion to the FAQPage block on /pricing. Tells Google + other crawlers
 *  what kind of app this is, what it costs (per tier), and where the docs
 *  live. Skipping `aggregateRating` until we have real public reviews —
 *  Google de-ranks fabricated rating counts.
 *
 *  Prices below are the publicly listed monthly USD amounts from /pricing.
 *  If those change, also update src/components/marketing/pricing-preview.tsx.
 * ==========================================================================*/

const SOFTWARE_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DocketLens",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Legal Research",
  operatingSystem: "Web",
  url: SITE,
  description:
    "AI-summarized federal court dockets. Watch any party, judge, or law firm — get a digest the next morning. The PACER alternative.",
  publisher: { "@type": "Organization", name: "DocketLens", url: SITE },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      url: `${SITE}/pricing`,
      availability: "https://schema.org/InStock",
      description:
        "5 watchlists, daily email digest, one-line AI summaries, 7-day filing history.",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "29",
      priceCurrency: "USD",
      url: `${SITE}/pricing`,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "29",
        priceCurrency: "USD",
        unitText: "MON",
      },
      description:
        "50 watchlists, real-time + hourly alerts, paragraph + exec AI summaries, webhook delivery, BYO CourtListener token.",
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "149",
      priceCurrency: "USD",
      url: `${SITE}/pricing`,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "149",
        priceCurrency: "USD",
        unitText: "MON",
      },
      description:
        "Unlimited watchlists, 5 seats included ($25/seat after), public REST API, SOC2-ready audit log, Slack support channel.",
    },
  ],
  featureList: [
    "AI-summarized federal court dockets (extractive only)",
    "Watch parties, judges, law firms, attorneys, or specific cases",
    "Real-time, hourly, or daily alerts via email, webhook, in-app",
    "Public REST API with OpenAPI 3.1 spec",
    "Embeddable case widgets with oEmbed discovery",
    "RSS, Atom, and JSON Feed exports for blog, changelog, saved searches",
  ],
  sameAs: [
    "https://github.com/donnowyu/docketlens",
    "https://x.com/docketlens",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_LD) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <UseCases />
        <PricingPreview />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
