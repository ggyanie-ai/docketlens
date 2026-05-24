import Link from "next/link";
import { Rss, ArrowUpRight, Bookmark } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/app/copy-button";

export const metadata = {
  title: "Feeds",
  description:
    "Every RSS, Atom, and JSON Feed DocketLens publishes — for the blog, the changelog, and any saved search.",
};

const SITE = "https://docketlens.ai";

interface FeedRow {
  format: "RSS 2.0" | "Atom 1.0" | "JSON Feed 1.1";
  ext: "xml" | "atom" | "json";
  /** application/rss+xml etc. */
  mime: string;
  href: string;
  /** Absolute URL — what consumers paste into readers. */
  abs: string;
}

function rows(base: string): FeedRow[] {
  return [
    { format: "RSS 2.0", ext: "xml", mime: "application/rss+xml", href: `${base}.xml`, abs: `${SITE}${base}.xml` },
    { format: "Atom 1.0", ext: "atom", mime: "application/atom+xml", href: `${base}.atom`, abs: `${SITE}${base}.atom` },
    { format: "JSON Feed 1.1", ext: "json", mime: "application/feed+json", href: `${base}.json`, abs: `${SITE}${base}.json` },
  ];
}

const BLOG = rows("/blog/feed");
const CHANGELOG = rows("/changelog/feed");

const SAVED_SEARCH_EXAMPLE = `${SITE}/api/v1/saved-searches/srch_F3kQ9pR2Lm/feed.xml?q=Acme&court=S.D.N.Y.&name=Acme%20in%20SDNY`;

function FeedTable({ caption, items }: { caption: string; items: FeedRow[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)]">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[color:var(--color-bg-subtle)]/40">
          <tr className="text-left">
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
              Format
            </th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
              URL
            </th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)] text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.ext}
              className="border-t border-[color:var(--color-border)]/70 align-middle"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Rss
                    className={
                      row.ext === "xml"
                        ? "size-3.5 text-[color:var(--color-accent)]"
                        : "size-3.5 text-[color:var(--color-fg-muted)]"
                    }
                  />
                  <span className="font-medium">{row.format}</span>
                </div>
                <p className="mt-0.5 font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                  {row.mime}
                </p>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={row.href as never}
                  className="font-mono text-[12px] break-all text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] underline underline-offset-2 decoration-[color:var(--color-border-strong)]"
                  target="_blank"
                >
                  {row.abs}
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                <CopyButton text={row.abs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FeedsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-10">
          <p className="eyebrow mb-3">Feeds</p>
          <h1 className="display-1">
            Every feed we{" "}
            <span className="italic text-[color:var(--color-accent)]">
              publish.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
            All three syndication formats for every source. The marketing
            feeds are public; saved-search feeds are per-user — treat their
            URLs like a Calendly link.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-12 flex flex-col gap-10">
          <div>
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h2 className="font-serif text-2xl">Blog</h2>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  Long-form posts from{" "}
                  <Link
                    href={"/blog" as never}
                    className="text-[color:var(--color-fg)] underline underline-offset-2"
                  >
                    /blog
                  </Link>
                  . Updated whenever we ship.
                </p>
              </div>
              <Badge variant="outline">Public</Badge>
            </div>
            <FeedTable caption="Blog feed URLs" items={BLOG} />
          </div>

          <div>
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h2 className="font-serif text-2xl">Changelog</h2>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  One entry per release. Sourced from{" "}
                  <Link
                    href={"/changelog" as never}
                    className="text-[color:var(--color-fg)] underline underline-offset-2"
                  >
                    /changelog
                  </Link>
                  .
                </p>
              </div>
              <Badge variant="outline">Public</Badge>
            </div>
            <FeedTable caption="Changelog feed URLs" items={CHANGELOG} />
          </div>

          <div>
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h2 className="font-serif text-2xl">Saved searches</h2>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)] max-w-2xl">
                  Every saved search you create on /search has its own RSS,
                  Atom, and JSON Feed URL. Copy the URL from the saved-search
                  panel (click the{" "}
                  <Rss className="inline size-3 align-middle" /> icon) and
                  paste into any feed reader.
                </p>
              </div>
              <Badge variant="outline" className="inline-flex items-center gap-1">
                <Bookmark className="size-3" />
                Per-user
              </Badge>
            </div>

            <Card className="p-4 mt-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                URL template
              </p>
              <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-3 text-[11.5px] font-mono leading-relaxed text-[color:var(--color-fg)]">
{`GET /api/v1/saved-searches/{id}/feed.{xml|atom|json}
    ?q=…&court=…&nos=…&scope=all|patent|securities|antitrust
    &name=…&limit=1..50`}
              </pre>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                Example
              </p>
              <div className="mt-2 relative">
                <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-3 text-[11.5px] font-mono break-all leading-relaxed text-[color:var(--color-fg)]">
{SAVED_SEARCH_EXAMPLE}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={SAVED_SEARCH_EXAMPLE} />
                </div>
              </div>
              <p className="mt-3 text-[12px] text-[color:var(--color-fg-muted)] leading-relaxed">
                The URL itself is the secret — anyone with it can read the
                feed. Don&apos;t paste it in a public Slack channel.
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-br from-[color:var(--color-accent-soft)]/20 to-transparent">
            <h3 className="font-serif text-xl">Auto-discovery</h3>
            <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
              Every marketing page on{" "}
              <code className="font-mono text-xs">docketlens.ai</code> ships{" "}
              <code className="font-mono text-xs">
                &lt;link rel=&quot;alternate&quot;&gt;
              </code>{" "}
              tags for all six blog + changelog feeds. Browser RSS plugins
              (Vivaldi, Brave) and reader auto-detect (Feedbin&apos;s
              &ldquo;subscribe to site&rdquo;) will offer them automatically
              — you don&apos;t have to paste anything by hand.
            </p>
            <p className="mt-3 text-sm">
              <Link
                href={"/blog" as never}
                className="font-mono text-[12px] uppercase tracking-wider text-[color:var(--color-fg)] underline underline-offset-2 hover:text-[color:var(--color-accent)] inline-flex items-center gap-1"
              >
                Try it on /blog
                <ArrowUpRight className="size-3" />
              </Link>
            </p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
