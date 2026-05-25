import Link from "next/link";
import { BookOpen, Hash, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  GLOSSARY,
  findTerm,
  termsByCategory,
  type GlossaryTerm,
} from "@/content/glossary";
import {
  BreadcrumbJsonLd,
  DefinedTermSetJsonLd,
} from "@/lib/structured-data";

export const metadata = {
  title: "Glossary",
  description:
    "Plain-English definitions for the legal terms used inside DocketLens — NOS, MDL, TRO, Rule 12(b)(6), Markman, and more.",
};

const GLOSSARY_DESCRIPTION =
  "Plain-English definitions for the legal terms used inside DocketLens — NOS codes, MDL, TRO, Rule 12(b)(6), Markman, and more.";

export default function GlossaryPage() {
  const grouped = termsByCategory();
  const categoryLabel = (key: string) =>
    CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Glossary", url: "/glossary" },
        ]}
      />
      <DefinedTermSetJsonLd
        name="DocketLens federal-court glossary"
        description={GLOSSARY_DESCRIPTION}
        pageUrl="/glossary"
        terms={GLOSSARY.map((t) => ({
          slug: t.slug,
          name: t.term,
          // Strip markdown emphasis for a clean SERP-quality first sentence.
          description: t.body
            .split(/\n\n/)[0]
            .replace(/\*\*?(.+?)\*\*?/g, "$1")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 320),
          category: categoryLabel(t.category),
        }))}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-20 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <p className="eyebrow">Reference</p>
            <Badge variant="outline">{GLOSSARY.length} terms</Badge>
          </div>
          <h1 className="display-1">
            Plain English for{" "}
            <span className="italic text-[color:var(--color-accent)]">
              federal court vocabulary.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Every term DocketLens uses — what it means, why it matters, and
            what to look at next. Written for the analyst, the reporter, and
            the founder reading their first docket. Lawyers can skip this.
          </p>
        </section>

        {/* Table of contents — category jump nav */}
        <section className="mx-auto max-w-5xl px-6 pb-10">
          <Card className="p-5">
            <p className="eyebrow mb-3">Jump to</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const count = grouped[c.key]?.length ?? 0;
                return (
                  <a
                    key={c.key}
                    href={`#cat-${c.key}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-1.5 text-xs hover:border-[color:var(--color-accent)] transition-colors"
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                      {count}
                    </span>
                  </a>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Glossary entries grouped by category */}
        <section className="mx-auto max-w-5xl px-6 pb-20">
          {CATEGORIES.map((cat) => {
            const terms = grouped[cat.key] ?? [];
            if (terms.length === 0) return null;
            return (
              <div
                key={cat.key}
                id={`cat-${cat.key}`}
                className="mb-14 last:mb-0 scroll-mt-24"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="size-4 text-[color:var(--color-fg-subtle)]" />
                  <p className="eyebrow">{cat.label}</p>
                </div>
                <h2 className="font-serif text-2xl tracking-tight mb-1">
                  {cat.label}
                </h2>
                <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
                  {cat.blurb}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {terms.map((t) => (
                    <Entry key={t.slug} term={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Footer hint */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-6 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <Sparkles className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              <p className="font-medium text-[color:var(--color-fg)]">
                Term missing?
              </p>
              <p className="mt-2">
                We&apos;ll add it.{" "}
                <Link
                  href={"/contact?topic=general" as never}
                  className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
                >
                  Ping us
                </Link>{" "}
                with the term and where you got stuck. Definitions usually
                land within a release.
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={"/docs" as never}>Documentation</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={"/legal/data-sources" as never}>
                    Data sources
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Entry({ term }: { term: GlossaryTerm }) {
  return (
    <Card
      id={term.slug}
      className="p-5 scroll-mt-24 hover:border-[color:var(--color-border-strong)] transition-colors"
    >
      <div className="flex items-start gap-2 flex-wrap">
        <a
          href={`#${term.slug}`}
          aria-label={`Permalink to ${term.term}`}
          className="group inline-flex items-baseline gap-2 ring-focus rounded"
        >
          <h3 className="font-serif text-lg tracking-tight">{term.term}</h3>
          <Hash
            aria-hidden
            className="size-3 mt-1 text-[color:var(--color-fg-subtle)] opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </a>
        {term.short && (
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] self-center">
            {term.short}
          </p>
        )}
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-fg-muted)]">
        {term.body}
      </p>
      {term.related && term.related.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[color:var(--color-border)]">
          <p className="eyebrow mb-2">Related</p>
          <div className="flex flex-wrap gap-1.5">
            {term.related.map((r) => {
              const t = findTerm(r);
              if (!t) return null;
              return (
                <a
                  key={r}
                  href={`#${r}`}
                  className="inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] underline underline-offset-2 transition-colors"
                >
                  {t.term}
                  <ArrowRight className="size-3" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
