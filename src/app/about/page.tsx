import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BreadcrumbJsonLd,
  OrganizationJsonLd,
} from "@/lib/structured-data";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-16 md:pt-24 pb-12">
          <p className="eyebrow mb-4">About</p>
          <h1 className="display-1">
            We built DocketLens because{" "}
            <span className="italic text-[color:var(--color-accent)]">
              the existing tools were broken or expensive.
            </span>
          </h1>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-12 prose prose-invert dark:prose-invert max-w-3xl">
          <Card className="p-8 md:p-10">
            <p className="font-serif text-2xl leading-relaxed text-[color:var(--color-fg-muted)]">
              Federal court dockets are public records. They&apos;re also one
              of the most undermonetized signal sources on the internet — a
              new lawsuit can move a stock, change a deal&apos;s economics,
              break a news cycle. And yet, the tools to actually <em>watch</em>{" "}
              them are either:
            </p>
            <ol className="mt-6 ml-5 list-decimal space-y-3 text-[color:var(--color-fg-muted)] text-base">
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Free and unusable
                </strong>{" "}
                — PACER charges $0.10/page, no alerts, an interface that
                hasn&apos;t materially changed in 25 years.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Excellent and unaffordable
                </strong>{" "}
                — Lex Machina, Docket Navigator, Bloomberg Law: $25k to
                $100k+ per year. Worth it if you have it; out of reach for
                most.
              </li>
            </ol>
            <p className="mt-6 text-[color:var(--color-fg-muted)]">
              DocketLens is the middle. Beautiful product. Fair pricing.
              Real AI summaries. Built on the public RECAP archive maintained
              by the Free Law Project — the same data the enterprise tools
              ride on, just made affordable.
            </p>

            <h2 className="mt-12 font-serif text-2xl tracking-tight">
              What we believe
            </h2>
            <ul className="mt-4 ml-5 list-disc space-y-2 text-[color:var(--color-fg-muted)] text-base">
              <li>
                Public records should be{" "}
                <strong className="text-[color:var(--color-fg)]">searchable and watchable</strong> by anyone.
              </li>
              <li>
                AI summaries should be{" "}
                <strong className="text-[color:var(--color-fg)]">extractive only</strong> — never predictive, never opining.
              </li>
              <li>
                Pricing should be{" "}
                <strong className="text-[color:var(--color-fg)]">honest and on the page</strong>. No "contact sales" walls below $200/mo.
              </li>
              <li>
                The product should be{" "}
                <strong className="text-[color:var(--color-fg)]">beautiful</strong>. Information density is not an excuse for visual ugliness.
              </li>
            </ul>

            <h2 className="mt-12 font-serif text-2xl tracking-tight">
              The team
            </h2>
            <p className="mt-4 text-[color:var(--color-fg-muted)]">
              Solo founder for now. Pre-revenue, in active development. We
              build in public — follow{" "}
              <a
                href="https://x.com/docketlens"
                className="underline underline-offset-2 text-[color:var(--color-fg)]"
              >
                @docketlens
              </a>{" "}
              or read the{" "}
              <Link
                href={"/changelog" as never}
                className="underline underline-offset-2 text-[color:var(--color-fg)]"
              >
                changelog
              </Link>
              .
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={"/signup" as never}>Get early access</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={"/demo" as never}>See the live demo</Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
