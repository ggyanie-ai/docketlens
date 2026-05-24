import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { POSTS } from "@/content/posts";

export const metadata = {
  title: "Blog",
  alternates: {
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
};

export default function BlogIndex() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow mb-4">Notes from the workbench</p>
        <h1 className="display-1">Blog</h1>
        <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
          Building in public. Mostly about court data, pricing experiments,
          and what we&apos;re learning from talking to lawyers, journalists,
          and analysts who use DocketLens every day.
        </p>

        <div className="mt-14 flex flex-col">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}` as never}
              className="group border-t border-[color:var(--color-border)] py-8 first:border-t-0"
            >
              <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] uppercase tracking-[0.18em]">
                {post.date} · {post.readMinutes} min read
              </p>
              <h2 className="mt-2 font-serif text-2xl md:text-3xl tracking-tight group-hover:text-[color:var(--color-accent)] transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 text-[15px] text-[color:var(--color-fg-muted)] leading-relaxed">
                {post.excerpt}
              </p>
              <p className="mt-4 font-mono text-xs text-[color:var(--color-fg-subtle)]">
                — {post.author}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
