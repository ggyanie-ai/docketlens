import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Data sources" };

export default function DataSourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Where this comes from</p>
        <h1 className="display-2">Data sources</h1>

        <Card className="mt-10 p-8 md:p-10 max-w-none text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
          <h2 className="font-serif text-2xl tracking-tight !mt-0 text-[color:var(--color-fg)]">
            CourtListener / RECAP — primary
          </h2>
          <p className="mt-3">
            All federal court docket and filing data on DocketLens comes from{" "}
            <a
              href="https://www.courtlistener.com"
              target="_blank"
              rel="noopener"
              className="text-[color:var(--color-fg)] underline underline-offset-2 inline-flex items-center gap-1"
            >
              CourtListener
              <ExternalLink className="size-3" />
            </a>{" "}
            and the{" "}
            <a
              href="https://free.law/recap/"
              target="_blank"
              rel="noopener"
              className="text-[color:var(--color-fg)] underline underline-offset-2 inline-flex items-center gap-1"
            >
              RECAP archive
              <ExternalLink className="size-3" />
            </a>
            , two projects of the{" "}
            <a
              href="https://free.law"
              target="_blank"
              rel="noopener"
              className="text-[color:var(--color-fg)] underline underline-offset-2 inline-flex items-center gap-1"
            >
              Free Law Project
              <ExternalLink className="size-3" />
            </a>
            . FLP is a 501(c)(3) nonprofit. Their work is what makes
            DocketLens possible at our price point. Please consider donating.
          </p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Coverage
          </h2>
          <ul className="list-disc ml-5 mt-3 space-y-1.5">
            <li>U.S. District Courts — all 94 districts</li>
            <li>U.S. Courts of Appeals — all 13 circuits</li>
            <li>U.S. Supreme Court — opinions + dockets</li>
            <li>U.S. Bankruptcy Courts (most)</li>
            <li>Specialty courts (Tax, International Trade, Veterans Appeals, etc.)</li>
          </ul>
          <p className="mt-4">
            Federal coverage is comprehensive. State courts are not currently
            included — see our{" "}
            <Link
              href={"/changelog" as never}
              className="text-[color:var(--color-fg)] underline underline-offset-2"
            >
              changelog
            </Link>{" "}
            for state-court rollout plans.
          </p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            What&apos;s NOT in DocketLens
          </h2>
          <ul className="list-disc ml-5 mt-3 space-y-1.5">
            <li>Sealed cases — RECAP doesn&apos;t archive sealed cases; we never have them.</li>
            <li>Documents not yet uploaded to RECAP — usually a delay of minutes to hours from filing.</li>
            <li>State-court records (yet).</li>
            <li>Anything subject to a protective order.</li>
          </ul>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Freshness
          </h2>
          <p className="mt-3">
            We ingest from CourtListener hourly (Pro+) or daily (Free).
            Median time from RECAP availability to alert delivery on Pro
            real-time tier is ~4 seconds.
          </p>

          <h2 className="font-serif text-2xl tracking-tight mt-10 text-[color:var(--color-fg)]">
            Accuracy & corrections
          </h2>
          <p className="mt-3">
            We don&apos;t modify the underlying docket data. If you spot an
            error in a docket or filing as displayed by DocketLens, please
            confirm against the source on CourtListener first. If the issue
            is in our cache (e.g. a stale title), email{" "}
            <code>data@docketlens.ai</code> and we&apos;ll re-pull.
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
