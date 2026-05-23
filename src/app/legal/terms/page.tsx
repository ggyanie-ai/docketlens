import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="display-2">Terms of Service</h1>
        <p className="mt-4 text-sm text-[color:var(--color-fg-subtle)] font-mono">
          Last updated: 2026-05-23.
        </p>
        <Card className="mt-10 p-8 md:p-10 max-w-none text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
          <h2 className="font-serif text-2xl tracking-tight !mt-0 text-[color:var(--color-fg)]">
            Acceptance
          </h2>
          <p className="mt-3">By creating a DocketLens account, you agree to these terms. If you&apos;re signing up on behalf of an organization, you confirm you have authority to bind that organization.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            What DocketLens is — and isn&apos;t
          </h2>
          <p className="mt-3">DocketLens is an aggregator and summarizer of public U.S. federal court docket data. <strong className="text-[color:var(--color-fg)]">It is not legal advice.</strong> Our AI summaries are extractive — they restate what&apos;s in the source filing and never predict outcomes or recommend strategy. If you&apos;re making a decision that turns on the contents of a filing, read the filing.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Data source acknowledgement
          </h2>
          <p className="mt-3">Federal court docket data is sourced from the RECAP archive maintained by the Free Law Project. We comply with their terms; you in turn agree not to scrape, redistribute, or resell DocketLens data in bulk without our written permission.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Acceptable use
          </h2>
          <ul className="list-disc ml-5 mt-3 space-y-1.5">
            <li>Don&apos;t use the service to harass, dox, or target individuals.</li>
            <li>Don&apos;t attempt to bypass our rate limits, scrape our API at scale outside your plan, or otherwise abuse the platform.</li>
            <li>Don&apos;t share API keys publicly or commit them to source control.</li>
            <li>One account per person on Free / Pro tiers. Multi-seat usage requires Team or Enterprise.</li>
          </ul>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Billing & cancellation
          </h2>
          <p className="mt-3">Paid plans bill monthly via Stripe. You can cancel anytime from Settings → Billing; you keep access through the end of the paid period. Annual plans (when offered) are pre-paid and non-refundable except where required by law.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Service-level expectations
          </h2>
          <p className="mt-3">We target 99.5% monthly uptime. We&apos;ll communicate planned maintenance in advance. For unplanned outages of more than 4 hours in a billing cycle, contact <code>support@docketlens.ai</code> for a pro-rated credit.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Limits of liability
          </h2>
          <p className="mt-3">DocketLens is provided &ldquo;as is&rdquo;. Our maximum aggregate liability for any claim is the amount you paid us in the prior 12 months. We&apos;re not liable for indirect, consequential, or incidental damages.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Changes
          </h2>
          <p className="mt-3">We may update these terms; material changes get 30 days&apos; notice via email. Continued use after the notice constitutes acceptance.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Contact
          </h2>
          <p className="mt-3"><code>legal@docketlens.ai</code></p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
