import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Clock,
  Crosshair,
  XOctagon,
  Award,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = {
  title: "Security disclosure policy",
  description:
    "How to responsibly report a vulnerability to DocketLens — scope, response times, safe-harbor, PGP key, and our Hall of Fame.",
  openGraph: {
    title: "DocketLens security disclosure policy",
    description: "How to responsibly report a vulnerability to DocketLens — scope, response times, safe-harbor, PGP key, and our Hall of Fame.",
    url: "/security",
    type: "article" as const,
  },
};

/* ============================================================================
 *  /security — human-readable counterpart to /.well-known/security.txt
 * ==========================================================================*/

const IN_SCOPE = [
  "docketlens.ai and *.docketlens.ai",
  "The DocketLens REST API at docketlens.ai/api/v1/*",
  "The DocketLens email + webhook delivery infrastructure",
  "Our open-source components on github.com/donnowyu/docketlens",
];

const OUT_OF_SCOPE = [
  "Findings that require physical access to a user's device",
  "Social-engineering, phishing, or denial-of-service attacks",
  "Self-XSS, missing security headers without demonstrated impact",
  "Reports against third-party services (CourtListener, Resend, Stripe, Neon, Vercel)",
  "Automated scanner output without manual triage",
];

const SAFE_HARBOR = [
  "We will not initiate legal action against you for good-faith research that follows this policy.",
  "We will not share your identifying information with third parties without your consent.",
  "Research that respects the in-scope / out-of-scope lines and avoids user-data harm is authorized.",
];

export default function SecurityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Security disclosure", url: "/security" },
        ]}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-16 md:pt-20 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <p className="eyebrow">Security</p>
            <Badge variant="accent">disclosure policy</Badge>
          </div>
          <h1 className="display-1">
            Help us keep{" "}
            <span className="italic text-[color:var(--color-accent)]">
              users safe.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            If you&apos;ve found something that could put DocketLens users at
            risk — credential leak, missing authz check, injection, key
            disclosure, anything — we want to know fast. This page is the
            mirror of{" "}
            <a
              href="/.well-known/security.txt"
              className="text-[color:var(--color-fg)] underline underline-offset-2"
            >
              /.well-known/security.txt
            </a>{" "}
            and the source of truth.
          </p>
        </section>

        {/* Contact card */}
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <Card className="p-7 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="eyebrow mb-1">Contact</p>
                  <p className="font-mono text-sm">
                    <a
                      href="mailto:security@docketlens.ai"
                      className="text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] underline underline-offset-4"
                    >
                      security@docketlens.ai
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
                  <ShieldCheck className="size-5 text-[color:var(--color-fg-muted)]" />
                </div>
                <div>
                  <p className="eyebrow mb-1">Encryption</p>
                  <p className="text-sm text-[color:var(--color-fg-muted)]">
                    PGP key publication pending — for now, email is plain.
                    Reach out before sending sensitive payloads.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
                  <Clock className="size-5 text-[color:var(--color-fg-muted)]" />
                </div>
                <div>
                  <p className="eyebrow mb-1">Response time</p>
                  <p className="text-sm">
                    Within{" "}
                    <span className="font-medium text-[color:var(--color-fg)]">
                      24 hours
                    </span>{" "}
                    on weekdays, 48 hours on weekends.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* What to send */}
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <h2 className="font-serif text-2xl tracking-tight mb-3">
            What to include in your report
          </h2>
          <Card className="p-6">
            <ul className="list-decimal ml-5 space-y-3 text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  A clear description
                </strong>{" "}
                of the vulnerability and the impact, in your own words.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Reproduction steps
                </strong>{" "}
                — exact URLs, payloads, headers, screenshots. The faster we
                can repro, the faster we patch.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Your preferred public-credit name
                </strong>{" "}
                (or &quot;stay anonymous&quot;) for the Hall of Fame.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Any temporary mitigation
                </strong>{" "}
                you would suggest. We&apos;ll take what makes sense.
              </li>
            </ul>
          </Card>
        </section>

        {/* Scope */}
        <section className="mx-auto max-w-4xl px-6 pb-10 grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="size-4 text-[color:var(--color-success)]" />
              <p className="eyebrow">In scope</p>
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              {IN_SCOPE.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-[color:var(--color-success)] mt-0.5">+</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <XOctagon className="size-4 text-[color:var(--color-warning)]" />
              <p className="eyebrow">Out of scope</p>
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              {OUT_OF_SCOPE.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-[color:var(--color-warning)] mt-0.5">−</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Safe harbor */}
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <h2 className="font-serif text-2xl tracking-tight mb-3">
            Safe harbor
          </h2>
          <Card className="p-6">
            <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed mb-4">
              We follow good-faith security-research principles. Specifically:
            </p>
            <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              {SAFE_HARBOR.map((x) => (
                <li key={x} className="flex gap-2">
                  <ShieldCheck className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-[color:var(--color-fg-subtle)] leading-relaxed">
              Adapted from the Disclose.io core terms. We&apos;ll honor the
              spirit of that framework even where the letter doesn&apos;t
              cover an edge case.
            </p>
          </Card>
        </section>

        {/* Hall of fame */}
        <section
          id="acknowledgments"
          className="mx-auto max-w-4xl px-6 pb-10 scroll-mt-24"
        >
          <h2 className="font-serif text-2xl tracking-tight mb-3">
            <Award className="inline size-5 mr-2 -translate-y-px text-[color:var(--color-accent)]" />
            Hall of fame
          </h2>
          <Card className="p-6 border-dashed">
            <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              We&apos;re a brand-new product and haven&apos;t received any
              reports yet. When we do, we&apos;ll list every researcher who
              has helped us improve here — by name (or pseudonym, or
              anonymous, your choice), with the date and a one-line note
              about the class of issue.
            </p>
            <p className="mt-4 text-xs font-mono text-[color:var(--color-fg-subtle)]">
              First reporter gets a permanent #1 — and a hand-written thank you.
            </p>
          </Card>
        </section>

        {/* Rewards */}
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <Card className="p-6 flex items-start gap-3">
            <AlertTriangle className="size-4 mt-0.5 text-[color:var(--color-warning)] shrink-0" />
            <div className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              <p className="font-medium text-[color:var(--color-fg)]">
                On bounty payouts
              </p>
              <p className="mt-2">
                We don&apos;t run a paid bounty program today. For
                high-severity findings, we&apos;ll happily send swag, a real
                thank-you letter, and credit in this Hall of Fame. As the
                product matures, we&apos;ll likely partner with a bounty
                platform — this page will update before that happens.
              </p>
            </div>
          </Card>
        </section>

        {/* Footer link */}
        <section className="mx-auto max-w-4xl px-6 pb-24 flex items-center justify-between flex-wrap gap-3 border-t border-[color:var(--color-border)] pt-6">
          <p className="text-xs text-[color:var(--color-fg-muted)]">
            Last reviewed: 2026-05-23.
          </p>
          <Link
            href={"/.well-known/security.txt" as never}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-accent)]"
          >
            Machine-readable: /.well-known/security.txt
            <ExternalLink className="size-3" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
