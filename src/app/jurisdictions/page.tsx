import Link from "next/link";
import { Building2, Gavel, Globe, MapPin, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CIRCUITS,
  SPECIALTY,
  SUPREME,
  TOTALS,
} from "@/content/jurisdictions";

export const metadata = {
  title: "Jurisdictions we cover",
  description:
    "Every federal court DocketLens indexes — 13 Courts of Appeals, 94 District Courts, ~90 Bankruptcy Courts, the Supreme Court, and the specialty federal courts.",
};

/* ============================================================================
 *  /jurisdictions — court directory
 *
 *  Deep-links to /search?court=<id>. The search page reads that param and
 *  pre-fills the court chip on mount.
 * ==========================================================================*/

export default function JurisdictionsPage() {
  // Group circuits by region
  const regions = Array.from(new Set(CIRCUITS.map((c) => c.region)));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-20 pb-12">
          <p className="eyebrow mb-4">Coverage</p>
          <h1 className="display-1 max-w-4xl">
            Every federal court,{" "}
            <span className="italic text-[color:var(--color-accent)]">
              one search box.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            DocketLens indexes every federal district + circuit court in the
            United States, plus the Supreme Court and the major specialty
            courts. Click any court to drop straight into a pre-filtered
            search.
          </p>
        </section>

        {/* Totals strip */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              <Stat n={TOTALS.appeals} label="Circuit courts" />
              <Stat n={TOTALS.districts} label="District courts" />
              <Stat n={TOTALS.bankruptcy} label="Bankruptcy courts (approx)" />
              <Stat n={TOTALS.specialty} label="Specialty courts" />
              <Stat n={1} label="Supreme Court" />
            </div>
          </div>
        </section>

        {/* Supreme + specialty */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <p className="eyebrow mb-3">Top of the stack</p>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <CourtCard
              court={SUPREME}
              note="All argued + decided opinions, oral arguments, dockets."
              icon={Gavel}
            />
            <Card className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                  <Globe className="size-4 text-[color:var(--color-fg-muted)]" />
                </div>
                <h3 className="font-serif text-lg tracking-tight">
                  Specialty federal courts
                </h3>
              </div>
              <ul className="flex flex-col gap-1.5">
                {SPECIALTY.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/search?court=${c.id}` as never}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 hover:bg-[color:var(--color-bg-subtle)] transition-colors group"
                    >
                      <span className="text-sm">{c.full}</span>
                      <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors">
                        {c.short}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Circuits grouped by region */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          {regions.map((region) => (
            <div key={region} className="mb-12 last:mb-0">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="size-4 text-[color:var(--color-fg-subtle)]" />
                <p className="eyebrow">{region}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {CIRCUITS.filter((c) => c.region === region).map((g) => (
                  <Card key={g.circuit} className="p-6 flex flex-col gap-4">
                    {/* Circuit header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-serif text-lg tracking-tight">
                          {g.circuit}
                        </h3>
                        <Badge variant="accent">{g.districts.length} districts</Badge>
                      </div>
                      <Link
                        href={`/search?court=${g.appeals.id}` as never}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors font-mono"
                      >
                        <Gavel className="size-3" />
                        {g.appeals.full}
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    {/* District list */}
                    {g.districts.length > 0 ? (
                      <ul className="flex flex-col gap-0.5 border-t border-[color:var(--color-border)] pt-3">
                        {g.districts.map((d) => (
                          <li key={d.id}>
                            <Link
                              href={`/search?court=${d.id}` as never}
                              className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[color:var(--color-bg-subtle)] transition-colors group"
                            >
                              <span className="text-[13px] truncate">
                                {d.full}
                              </span>
                              <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors shrink-0">
                                {d.short}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[color:var(--color-fg-muted)] border-t border-[color:var(--color-border)] pt-3">
                        Specialty appellate court — no district courts beneath
                        it. Hears patent appeals, federal-claims appeals, and
                        certain administrative review.
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* What's not here */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <Card className="p-6 flex items-start gap-3">
            <Building2 className="size-4 mt-0.5 text-[color:var(--color-fg-subtle)] shrink-0" />
            <div>
              <p className="text-sm font-medium mb-2">
                What we don&apos;t cover (yet)
              </p>
              <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                State courts — they live in 50 different filing systems, none
                of which mirror to RECAP. We&apos;re piloting the top five
                states by case volume (NY, CA, TX, FL, DE) in Q4 2026. Sealed
                cases never appear here; RECAP never has them. See{" "}
                <Link
                  href={"/legal/data-sources" as never}
                  className="text-[color:var(--color-fg)] underline underline-offset-2 hover:text-[color:var(--color-accent)]"
                >
                  Data sources
                </Link>{" "}
                for the full coverage statement.
              </p>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Pick a court.{" "}
            <span className="italic text-[color:var(--color-accent)]">
              See every filing.
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
              <Link href={"/search" as never}>Open search</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <Card className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
      <p className="font-serif text-4xl tabular leading-none">{n}</p>
      <p className="mt-2 text-xs text-[color:var(--color-fg-muted)] uppercase tracking-wider">
        {label}
      </p>
    </Card>
  );
}

function CourtCard({
  court,
  note,
  icon: Icon,
}: {
  court: { id: string; short: string; full: string };
  note: string;
  icon: typeof Gavel;
}) {
  return (
    <Link href={`/search?court=${court.id}` as never} className="block group">
      <Card className="p-6 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors flex items-start gap-4">
        <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
          <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg tracking-tight">{court.full}</h3>
            <Badge variant="outline" className="text-[10px]">
              {court.short}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
            {note}
          </p>
        </div>
      </Card>
    </Link>
  );
}
