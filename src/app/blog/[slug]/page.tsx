import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { POSTS } from "@/content/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <article className="flex-1 mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link
          href={"/blog" as never}
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] font-mono mb-8"
        >
          <ArrowLeft className="size-3" />
          All posts
        </Link>

        <p className="eyebrow mb-4">{post.tag}</p>
        <h1 className="display-2 mb-4">{post.title}</h1>
        <p className="mt-4 text-sm text-[color:var(--color-fg-subtle)] font-mono">
          {post.date} · {post.readMinutes} min read · {post.author}
        </p>

        <div className="mt-12 prose dark:prose-invert max-w-none text-[16.5px] leading-[1.75] text-[color:var(--color-fg-muted)]">
          {post.body.map((block, i) => {
            if (block.type === "h2")
              return (
                <h2
                  key={i}
                  className="font-serif text-2xl md:text-3xl tracking-tight text-[color:var(--color-fg)] mt-12 mb-4"
                >
                  {block.text}
                </h2>
              );
            if (block.type === "h3")
              return (
                <h3
                  key={i}
                  className="font-serif text-xl tracking-tight text-[color:var(--color-fg)] mt-8 mb-3"
                >
                  {block.text}
                </h3>
              );
            if (block.type === "p")
              return (
                <p key={i} className="my-5">
                  {block.text}
                </p>
              );
            if (block.type === "pull")
              return (
                <blockquote
                  key={i}
                  className="my-8 border-l-2 border-[color:var(--color-accent)] pl-5"
                >
                  <p className="font-serif text-xl leading-snug text-[color:var(--color-fg)]">
                    {block.text}
                  </p>
                </blockquote>
              );
            if (block.type === "ul")
              return (
                <ul key={i} className="list-disc ml-6 my-5 space-y-2">
                  {block.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              );
            return null;
          })}
        </div>

        {post.tag === "Engineering" && (
          <Card className="mt-16 p-6 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                <Code2 className="size-4 text-[color:var(--color-fg-muted)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-1">For builders</p>
                <h3 className="font-serif text-xl tracking-tight">
                  Want to build on this?
                </h3>
                <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                  Every endpoint behind the engineering we just talked about
                  is in the interactive API reference — parameters, response
                  shapes, and copy-paste curl snippets included.
                </p>
                <Link
                  href={"/docs/api-reference" as never}
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-fg)] underline underline-offset-2 hover:text-[color:var(--color-accent)]"
                >
                  Open the API reference
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          </Card>
        )}

        <hr className="my-16 border-t border-[color:var(--color-border)]" />

        <p className="text-sm text-[color:var(--color-fg-muted)]">
          Have feedback on this post?{" "}
          <a
            href="https://x.com/docketlens"
            className="underline underline-offset-2 text-[color:var(--color-fg)]"
          >
            @docketlens
          </a>{" "}
          on X. We read everything.
        </p>
      </article>
      <SiteFooter />
    </>
  );
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
