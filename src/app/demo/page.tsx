import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export const metadata = {
  title: "Live demo",
  description: "See how DocketLens renders federal court dockets, without signing up.",
};

export default function DemoPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DocketLens demo dockets",
    description:
      "Synthetic sample federal-court dockets used for the public demo tour.",
    numberOfItems: SAMPLE_DOCKETS.length,
    itemListElement: SAMPLE_DOCKETS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.caseName,
      url: `${SITE}/demo/${d.id}`,
    })),
  };
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Demo", url: "/demo" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
          <p className="eyebrow mb-4">Live demo</p>
          <h1 className="display-1">See the product without signing up.</h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            These are synthetic sample cases — the same data the dashboard
            shows in dev. Click any case to see the full timeline view, AI
            summaries, parties, and judge details.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-tight">
              Sample cases
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href={"/signup" as never}>
                Get the real thing
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_DOCKETS.map((d) => (
              <Link
                key={d.id}
                href={`/demo/${d.id}` as never}
                className="block group"
              >
                <Card className="p-6 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/50 transition-colors">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                      {d.court} · {d.caseNumber}
                    </span>
                    {d.tags.slice(0, 2).map((t) => (
                      <Badge
                        key={t}
                        variant={
                          t === "Hot"
                            ? "danger"
                            : t === "Patent"
                            ? "accent"
                            : t === "Securities"
                            ? "warning"
                            : t === "Antitrust"
                            ? "info"
                            : "default"
                        }
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-base font-medium tracking-tight leading-snug">
                    {d.caseName}
                  </h3>
                  <p className="mt-2 text-xs text-[color:var(--color-fg-muted)]">
                    {d.natureOfSuit}
                  </p>
                  <p className="mt-4 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
                    <span className="text-[color:var(--color-accent)] font-medium">
                      Latest:
                    </span>{" "}
                    {d.entries[d.entries.length - 1].summaryOne ??
                      d.entries[d.entries.length - 1].short}
                  </p>
                  <p className="mt-4 text-[11px] font-mono text-[color:var(--color-fg-subtle)] uppercase tracking-wider group-hover:text-[color:var(--color-accent)] transition-colors">
                    Open case →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
