import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X, Quote, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERSONAS, getPersona } from "@/content/personas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPersona(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.hero.title} ${p.hero.titleAccent}`,
    description: p.hero.subtitle,
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPersona(slug);
  if (!p) notFound();

  const others = PERSONAS.filter((x) => x.slug !== p.slug);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-grid mask-fade-y opacity-30"
          />
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-[420px] w-[1000px] rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="accent">
                <p.icon className="size-3" />
                {p.hero.eyebrow}
              </Badge>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
                {p.audience}
              </span>
            </div>
            <h1 className="display-1 max-w-4xl">
              {p.hero.title}{" "}
              <span className="italic text-[color:var(--color-accent)]">
                {p.hero.titleAccent}
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              {p.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={p.ctaPrimary.href as never}>
                  {p.ctaPrimary.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={"/demo" as never}>See the live demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features — exactly three */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow mb-3">What makes this work for you</p>
          <h2 className="font-serif text-3xl tracking-tight mb-8">
            Three features that earn the subscription
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {p.features.map((f) => (
              <Card
                key={f.title}
                className="rounded-none border-0 bg-[color:var(--color-bg)] p-7 flex flex-col gap-4"
              >
                <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-fg)] dark:text-[color:var(--color-accent)]">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-serif text-xl tracking-tight leading-tight">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  {f.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Worked example */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <p className="eyebrow mb-3">A worked example</p>
            <h2 className="font-serif text-3xl tracking-tight mb-2">
              {p.example.title}
            </h2>
            <p className="text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-3xl mb-8">
              {p.example.intro}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <X className="size-4 text-[color:var(--color-fg-subtle)]" />
                  <p className="eyebrow">Before</p>
                </div>
                <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  {p.example.before.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-[color:var(--color-fg-subtle)] mt-0.5">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/15">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="size-4 text-[color:var(--color-accent)]" />
                  <p className="eyebrow">After — {p.example.monthCost}</p>
                </div>
                <ul className="space-y-2.5 text-sm leading-relaxed text-[color:var(--color-fg)]">
                  {p.example.after.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-[color:var(--color-accent)] mt-0.5">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <figure className="mt-10 max-w-3xl">
              <Quote
                aria-hidden
                className="size-5 text-[color:var(--color-accent)] mb-2"
              />
              <blockquote className="font-serif text-xl md:text-2xl leading-snug text-[color:var(--color-fg)]">
                &ldquo;{p.example.quote.text}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
                {p.example.quote.who}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Cross-link to other personas */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <p className="eyebrow mb-3">Other use cases</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/use/${o.slug}` as never} className="group block">
                <Card className="p-6 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                    <o.icon className="size-5 text-[color:var(--color-fg-muted)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow mb-1">{o.hero.eyebrow}</p>
                    <h3 className="font-serif text-lg tracking-tight leading-tight">
                      {o.hero.title}{" "}
                      <span className="italic text-[color:var(--color-fg-muted)]">
                        {o.hero.titleAccent}
                      </span>
                    </h3>
                  </div>
                  <ArrowRight className="size-4 text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-colors" />
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <h2 className="display-2">
            Ready to try it?{" "}
            <span className="italic text-[color:var(--color-accent)]">
              Free tier, no card.
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="xl">
              <Link href={p.ctaPrimary.href as never}>
                {p.ctaPrimary.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href={"/pricing" as never}>
                <ArrowLeft className="size-4" />
                See pricing
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function generateStaticParams() {
  return PERSONAS.map((p) => ({ slug: p.slug }));
}
