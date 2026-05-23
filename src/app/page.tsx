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

export default function HomePage() {
  return (
    <>
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
