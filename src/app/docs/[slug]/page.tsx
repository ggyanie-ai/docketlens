import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/lib/markdown";
import { PUBLIC_DOCS, getPublicDoc } from "@/content/public-docs";
import { BreadcrumbJsonLd } from "@/lib/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getPublicDoc(slug);
  if (!doc) return { title: "Not found" };
  return { title: doc.title, description: doc.summary };
}

async function loadDoc(file: string): Promise<string | null> {
  const target = path.join(process.cwd(), "docs", file);
  try {
    return await readFile(target, "utf8");
  } catch {
    return null;
  }
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getPublicDoc(slug);
  if (!doc) notFound();

  const raw = await loadDoc(doc.file);
  if (!raw) notFound();

  // Strip the leading `# Title` so we render our own page header
  const body = raw.replace(/^#\s+.+\n+/, "");

  // Lateral nav: other public docs
  const others = PUBLIC_DOCS.filter((d) => d.slug !== doc.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Documentation", url: "/docs" },
          { name: doc.title, url: `/docs/${doc.slug}` },
        ]}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-4xl px-6 pt-12 md:pt-16 pb-6">
          <Link
            href={"/docs" as never}
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono"
          >
            <ArrowLeft className="size-3" />
            All docs
          </Link>

          <header className="mt-6 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{doc.group}</Badge>
              <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                {doc.readMinutes} min read
              </span>
            </div>
            <h1 className="display-2">{doc.title}</h1>
            <p className="mt-4 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              {doc.summary}
            </p>
            <p className="mt-3 text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
              Rendered from{" "}
              <code className="text-[color:var(--color-fg-muted)]">
                docs/{doc.file}
              </code>{" "}
              at build time.
            </p>
          </header>
        </div>

        <article className="mx-auto max-w-4xl px-6 pb-16">
          <Card className="p-8 md:p-12">
            <Markdown source={body} />
          </Card>
        </article>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <p className="eyebrow mb-4">Keep reading</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {others.map((d) => (
              <Link
                key={d.slug}
                href={`/docs/${d.slug}` as never}
                className="group block"
              >
                <Card className="p-5 h-full hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] mb-1.5">
                    {d.group} · {d.readMinutes} min
                  </p>
                  <p className="font-serif text-lg tracking-tight leading-tight group-hover:text-[color:var(--color-accent)] transition-colors">
                    {d.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
                    {d.summary}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                    Open
                    <ArrowUpRight className="size-3" />
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

export function generateStaticParams() {
  return PUBLIC_DOCS.map((d) => ({ slug: d.slug }));
}
