import Link from "next/link";
import {
  Heart,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Code2,
  Puzzle,
  Share2,
  Scale,
  HandHeart,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Donate to the Free Law Project",
  description:
    "DocketLens rides entirely on the public RECAP archive maintained by the Free Law Project. Here's how to support the upstream — and what we do too.",
};

/* ============================================================================
 *  /donate — citizenship + good karma.
 *
 *  We are explicit: every CourtListener API call, every cached docket entry,
 *  every search result is downstream of work the Free Law Project does.
 *  Page tells our customers about it and asks them to consider a small
 *  recurring donation to FLP.
 * ==========================================================================*/

const SUGGESTED = [
  {
    monthly: "$5",
    fit: "if you use the free tier",
    detail: "Covers FLP's marginal cost of keeping one heavy user alive.",
  },
  {
    monthly: "$15",
    fit: "if you pay us $49/mo",
    detail: "About a third of what you pay us — and what we're aiming for ourselves.",
  },
  {
    monthly: "$50",
    fit: "if you pay us $199/mo Team",
    detail: "Roughly proportional. Tax-deductible in the US.",
  },
];

const OTHER_WAYS = [
  {
    icon: Puzzle,
    title: "Install the RECAP browser extension",
    body: "Free, takes 30 seconds. Every time you read a PACER document through PACER itself, RECAP uploads the public copy to the free archive. You become part of the supply chain.",
    href: "https://free.law/recap/",
  },
  {
    icon: Code2,
    title: "Contribute to CourtListener on GitHub",
    body: "FLP's open-source platform is on GitHub. Bug reports, PRs, and docs help land alongside cash donations.",
    href: "https://github.com/freelawproject/courtlistener",
  },
  {
    icon: Share2,
    title: "Tell your firm or newsroom about RECAP",
    body: "Most lawyers and journalists who'd benefit don't know the archive exists. A 30-second mention is the highest-leverage donation you can make.",
    href: "https://free.law/about/",
  },
];

export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-[420px] w-[1000px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-5xl px-6 pt-16 md:pt-24 pb-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="accent">
                <Heart className="size-3" />
                Citizenship
              </Badge>
            </div>
            <h1 className="display-1 max-w-3xl">
              The shoulders we stand on belong to the{" "}
              <span className="italic text-[color:var(--color-accent)]">
                Free Law Project.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              DocketLens does not exist without RECAP — the public archive of
              federal court records maintained by the Free Law Project, a
              501(c)(3) non-profit. Every search, every alert, every AI
              summary on this site is downstream of decades of their work.
              This page tells you how to support them — and what we&apos;re
              doing too.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg">
                <a
                  href="https://donate.free.law"
                  target="_blank"
                  rel="noopener"
                >
                  <Heart className="size-4" />
                  Donate to Free Law Project
                  <ExternalLink className="size-3" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://free.law"
                  target="_blank"
                  rel="noopener"
                >
                  Learn more about FLP
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Suggested amounts */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <p className="eyebrow mb-3">Suggested amounts</p>
          <h2 className="font-serif text-2xl tracking-tight mb-2">
            Match your spend on us
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6 max-w-2xl">
            A useful heuristic: donate something. Below are the numbers we
            use ourselves.
          </p>
          <div className="grid md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {SUGGESTED.map((s) => (
              <Card
                key={s.monthly}
                className="rounded-none border-0 bg-[color:var(--color-bg)] p-6"
              >
                <p className="eyebrow">{s.fit}</p>
                <p className="mt-3 font-serif text-4xl tabular leading-none">
                  {s.monthly}
                  <span className="ml-1 text-base text-[color:var(--color-fg-muted)] font-mono">
                    / mo
                  </span>
                </p>
                <p className="mt-3 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                  {s.detail}
                </p>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-xs text-[color:var(--color-fg-subtle)] leading-relaxed max-w-2xl">
            FLP is a 501(c)(3); donations are tax-deductible to the extent
            allowed by US law. They accept cards, ACH, and DAFs through the
            link above.
          </p>
        </section>

        {/* What we do */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex items-center gap-2 mb-3">
              <p className="eyebrow">What DocketLens does</p>
              <Badge variant="outline">our commitment</Badge>
            </div>
            <h2 className="font-serif text-2xl tracking-tight mb-2">
              The money we owe upstream
            </h2>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <HandHeart className="size-4 text-[color:var(--color-accent)]" />
                  <p className="eyebrow">Today</p>
                </div>
                <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">✓</span>
                    <span>
                      Every public DocketLens page that surfaces RECAP data
                      credits CourtListener / FLP by name.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">✓</span>
                    <span>
                      <Link
                        href={"/legal/data-sources" as never}
                        className="underline underline-offset-2 text-[color:var(--color-fg)]"
                      >
                        /legal/data-sources
                      </Link>{" "}
                      is the canonical attribution statement.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">✓</span>
                    <span>
                      Our blog has a launch post explaining the RECAP
                      relationship in plain English.
                    </span>
                  </li>
                </ul>
              </Card>
              <Card className="p-6 border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/15">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-[color:var(--color-accent)]" />
                  <p className="eyebrow">As we scale</p>
                </div>
                <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg)]">
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">→</span>
                    <span>
                      Once we reach $10k MRR, we commit to donating{" "}
                      <span className="font-medium">5% of monthly
                      revenue</span> to FLP on the first of each month.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">→</span>
                    <span>
                      We&apos;ll explore a commercial-rate contract with
                      CourtListener once our API usage justifies it.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[color:var(--color-accent)] mt-0.5">→</span>
                    <span>
                      Any improvements we build on top of CourtListener
                      open-source code go back upstream as PRs.
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Other ways */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow mb-3">Other ways to help</p>
          <h2 className="font-serif text-2xl tracking-tight mb-2">
            Free, often higher leverage
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6 max-w-2xl">
            If $5/mo isn&apos;t feasible, here are no-money options —
            ranked roughly by impact.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {OTHER_WAYS.map((w) => (
              <a
                key={w.title}
                href={w.href}
                target="_blank"
                rel="noopener"
                className="group block"
              >
                <Card className="p-6 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors flex flex-col gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                    <w.icon className="size-4 text-[color:var(--color-fg-muted)]" />
                  </div>
                  <h3 className="font-serif text-lg tracking-tight leading-tight">
                    {w.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                    {w.body}
                  </p>
                  <p className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors">
                    Open link
                    <ExternalLink className="size-3" />
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Why this exists */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <Card className="p-8 md:p-10">
            <Scale
              aria-hidden
              className="size-5 text-[color:var(--color-accent)] mb-3"
            />
            <h2 className="font-serif text-2xl tracking-tight mb-3">
              Why we put this page on the marketing site
            </h2>
            <p className="text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
              Every modern legal-tech tool — Lex Machina, Bloomberg Law,
              Docket Navigator, us — depends on the public-records work the
              Free Law Project has done since 2010. Most of those companies
              don&apos;t mention it. We do, because the alternative is a
              future where RECAP gets starved of donations, the archive
              gets sparser, and every product on top suffers. Even small
              recurring donations from our users would meaningfully change
              FLP&apos;s budget — they operate lean enough that{" "}
              <span className="font-medium text-[color:var(--color-fg)]">
                $10–15/mo from 1,000 supporters is a step-change
              </span>{" "}
              for them.
            </p>
          </Card>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Donate once, donate monthly,{" "}
            <span className="italic text-[color:var(--color-accent)]">
              just donate something.
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="xl">
              <a
                href="https://donate.free.law"
                target="_blank"
                rel="noopener"
              >
                <Heart className="size-4" />
                Donate to Free Law Project
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href={"/legal/data-sources" as never}>
                Read our attribution
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-[color:var(--color-fg-subtle)]">
            DocketLens is not affiliated with or endorsed by the Free Law
            Project. The above represents our voluntary commitments, not
            theirs.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
