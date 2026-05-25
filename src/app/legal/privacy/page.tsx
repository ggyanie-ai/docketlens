import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Legal", url: "/legal/privacy" },
          { name: "Privacy Policy", url: "/legal/privacy" },
        ]}
      />
      <SiteHeader />
      <main id="main" className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="display-2">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[color:var(--color-fg-subtle)] font-mono">
          Last updated: 2026-05-23 · Effective immediately for all users.
        </p>
        <Card className="mt-10 p-8 md:p-10 prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
          <h2 className="font-serif text-2xl tracking-tight !mt-0 text-[color:var(--color-fg)]">
            The short version
          </h2>
          <ul className="list-disc ml-5 mt-4 space-y-2">
            <li>We store the bare minimum to make the product work: your email, your watchlists, and the matches we found for you.</li>
            <li>We don&apos;t sell your data. We don&apos;t serve ads. We never will.</li>
            <li>The court-docket data we surface is public record from CourtListener and the RECAP archive.</li>
            <li>You can delete your account and all associated data at any time from <em>Settings → Security</em>.</li>
          </ul>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            What we collect
          </h2>
          <p className="mt-3">When you sign up, we collect: email, name, optional time zone, optional BYO-token. When you use the product, we store: your watchlists, your saved searches, your API keys (hashed), your alert delivery rules, and our own copy of the cached docket data your watchlists matched.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            What we DON&apos;T collect
          </h2>
          <p className="mt-3">No third-party tracking cookies. No advertising pixels. No fingerprinting. We use first-party server-side analytics (PostHog, when wired) for product metrics — no behavioral retargeting.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            How long we keep it
          </h2>
          <p className="mt-3">Account data: as long as your account is active. Within 30 days of deletion, all PII is purged. Aggregated, anonymized usage statistics may persist indefinitely for product analytics.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Where it lives
          </h2>
          <p className="mt-3">Postgres hosted by Neon (US East), application hosted by Vercel (US East). All traffic is TLS 1.3. Backups are encrypted at rest.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Subprocessors
          </h2>
          <ul className="list-disc ml-5 mt-3 space-y-1.5">
            <li>Vercel — hosting, edge cache</li>
            <li>Neon — managed Postgres</li>
            <li>Anthropic — AI summarization (zero-retention API)</li>
            <li>Resend — transactional email</li>
            <li>Stripe — payments (we never see card numbers)</li>
            <li>CourtListener / Free Law Project — upstream data source (we only send query parameters, no PII)</li>
          </ul>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Your rights
          </h2>
          <p className="mt-3">Per GDPR / CCPA / equivalent: right to access, rectify, delete, and port your data. Email <code>privacy@docketlens.ai</code> for any request. We respond within 30 days.</p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Contact
          </h2>
          <p className="mt-3"><code>privacy@docketlens.ai</code> — for any question this policy didn&apos;t answer.</p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
