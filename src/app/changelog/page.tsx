import { readFile } from "node:fs/promises";
import path from "node:path";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";

export const metadata = {
  title: "Changelog",
  description:
    "Every shipped change to DocketLens, by release. We track changes by ISO date (UTC).",
};

/** Number of milliseconds the file content cache is allowed to live. */
export const revalidate = 60;

async function loadChangelog(): Promise<string> {
  const file = path.join(process.cwd(), "docs", "CHANGELOG.md");
  try {
    return await readFile(file, "utf8");
  } catch {
    return "# Changelog\n\n_Not available._";
  }
}

export default async function ChangelogPage() {
  const raw = await loadChangelog();

  // Strip the leading `# Changelog` heading — we render our own page title.
  const body = raw.replace(/^#\s+Changelog\s*\n+/, "");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-16 md:pt-24 pb-8">
          <p className="eyebrow mb-4">Notes from the workbench</p>
          <h1 className="display-1">Changelog</h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
            Every shipped change, by release. We track changes by ISO date in
            UTC. Stable shipping starts at 1.0.0; before that, 0.x.y minor
            bumps may include breaking changes.
          </p>
          <p className="mt-3 text-xs font-mono text-[color:var(--color-fg-subtle)]">
            This page is rendered from{" "}
            <code className="text-[color:var(--color-fg-muted)]">
              docs/CHANGELOG.md
            </code>{" "}
            at build time.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-8 md:p-10">
            <article className="changelog-article">
              <Markdown source={body} />
            </article>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
