import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PUBLIC_DOCS } from "@/content/public-docs";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export const metadata = {
  title: "Documentation",
  description:
    "Reference, engineering notes, and the accessibility audit for DocketLens.",
};

export default function DocsIndex() {
  const groups = Array.from(new Set(PUBLIC_DOCS.map((d) => d.group)));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DocketLens documentation",
    description:
      "Reference, engineering notes, and the accessibility audit for DocketLens.",
    numberOfItems: PUBLIC_DOCS.length,
    itemListElement: PUBLIC_DOCS.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.title,
      url: `${SITE}/docs/${d.slug}`,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Docs", url: "/docs" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 md:pt-24 pb-10">
          <p className="eyebrow mb-4">Documentation</p>
          <h1 className="display-1">
            Everything we&apos;d want{" "}
            <span className="italic text-[color:var(--color-accent)]">
              to find ourselves.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Reference for the public API, engineering notes that explain how
            the data pipeline is wired, and the accessibility audit we run
            against the product. Internal operations docs (deploy, runbook)
            live in the repo, not here.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-20 flex flex-col gap-10">
          {groups.map((group) => {
            const items = PUBLIC_DOCS.filter((d) => d.group === group);
            return (
              <div key={group}>
                <p className="eyebrow mb-4">{group}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/docs/${d.slug}` as never}
                      className="group block"
                    >
                      <Card className="p-6 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                            <BookOpen className="size-4 text-[color:var(--color-fg-muted)]" />
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {d.readMinutes} min
                          </Badge>
                        </div>
                        <div>
                          <h2 className="font-serif text-xl tracking-tight leading-tight group-hover:text-[color:var(--color-accent)] transition-colors">
                            {d.title}
                          </h2>
                          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                            {d.summary}
                          </p>
                        </div>
                        <p className="mt-auto font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors inline-flex items-center gap-1">
                          Read
                          <ArrowUpRight className="size-3" />
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <Card className="p-6 mt-2 bg-gradient-to-br from-[color:var(--color-accent-soft)]/40 to-transparent">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="eyebrow mb-1">Interactive</p>
                <h3 className="font-serif text-2xl tracking-tight">
                  API reference, rendered from the spec.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)] max-w-xl">
                  Every endpoint, every schema — generated directly from{" "}
                  <code className="font-mono">/api/v1/openapi.json</code>. No
                  third-party JS bundle.
                </p>
              </div>
              <Link
                href={"/docs/api-reference" as never}
                className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-fg)] inline-flex items-center gap-1 underline underline-offset-2 hover:text-[color:var(--color-accent)]"
              >
                Open reference
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 mt-2 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
              Looking for the changelog? It lives at{" "}
              <Link
                href={"/changelog" as never}
                className="text-[color:var(--color-fg)] underline underline-offset-2"
              >
                /changelog
              </Link>
              . For everything else (deploy runbook, monetization plan,
              operational runbook) check{" "}
              <a
                href="https://github.com/donnowyu/docketlens/tree/main/docs"
                className="text-[color:var(--color-fg)] underline underline-offset-2"
                target="_blank"
                rel="noopener"
              >
                the repo&apos;s docs/ folder
              </a>
              .
            </p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
