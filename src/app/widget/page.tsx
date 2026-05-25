import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/app/copy-button";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

/* ============================================================================
 *  /widget — embed-snippet generator (marketing-style index).
 *
 *  NOTE: this page is NOT itself the embeddable widget — it's the page you
 *  read on docketlens.ai to learn what the widget is and copy a snippet.
 *  The actual iframe target is /widget/[id].
 *
 *  Renders under the marketing chrome (SiteHeader/SiteFooter), so we
 *  override the widget-scoped layout above by simply not rendering
 *  .docketlens-widget-root — the wrapper is harmless if empty.
 * ==========================================================================*/

export const metadata = {
  title: "Embeddable case widget",
  description:
    "Drop a single federal-court case into any article with one <iframe>. Free, attribution-only.",
};

const SITE = "https://docketlens.ai";

function snippetFor(id: string): string {
  return `<iframe src="${SITE}/widget/${id}"
  width="560" height="420" loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="DocketLens case — ${id}"
  style="border:0;border-radius:12px;max-width:100%;"></iframe>`;
}

export default function WidgetIndexPage() {
  const examples = SAMPLE_DOCKETS.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <Badge>Embeddable widget</Badge>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight mt-4">
            One case, one <span className="italic">&lt;iframe&gt;</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
            For journalists, researchers, and bloggers: drop any federal court
            docket we cover into your article with a single iframe tag. Free,
            attribution-only. The widget shows the case name, court, judge,
            NOS, and three most recent entries — and links back to the full
            page on DocketLens.
          </p>

          <div className="mt-12 space-y-12">
            {examples.map((d) => {
              const snippet = snippetFor(d.id);
              return (
                <div key={d.id} className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-muted)]">
                        Example · {d.court}
                      </p>
                      <h2 className="font-serif text-2xl mt-1">
                        {d.caseNameShort}
                      </h2>
                    </div>
                    <Link
                      href={`/widget/${d.id}` as never}
                      className="text-xs font-mono text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                      target="_blank"
                    >
                      Open widget standalone →
                    </Link>
                  </div>

                  {/* Live preview via real iframe — proves CSP/headers work. */}
                  <Card className="p-0 overflow-hidden bg-[color:var(--color-bg-elevated)]">
                    <iframe
                      src={`/widget/${d.id}`}
                      width={560}
                      height={420}
                      loading="lazy"
                      title={`Preview of ${d.caseName}`}
                      style={{
                        border: 0,
                        display: "block",
                        width: "100%",
                        background: "transparent",
                      }}
                    />
                  </Card>

                  {/* Embed snippet — collapsed by default. The live iframe
                      above is the primary affordance; the code is one
                      click away when needed. */}
                  <details className="group rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] overflow-hidden">
                    <summary className="cursor-pointer select-none flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-mono text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors">
                      <span className="inline-flex items-center gap-2">
                        <span className="transition-transform group-open:rotate-90">
                          ›
                        </span>
                        Show embed snippet
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                        {snippet.length} chars
                      </span>
                    </summary>
                    <div className="relative border-t border-[color:var(--color-border)]">
                      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-[color:var(--color-fg)]">
{snippet}
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton text={snippet} />
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>

          <Card className="mt-16 p-6">
            <h3 className="font-serif text-2xl">The fine print</h3>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              <li>
                <strong className="text-[color:var(--color-fg)]">Attribution required.</strong>{" "}
                The widget includes a small &ldquo;Powered by DocketLens&rdquo;
                footer link. Please don&apos;t strip it.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">Auto-updating.</strong>{" "}
                When the underlying docket gets a new entry, every embed
                updates the next time the iframe loads. No code change on
                your end.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">Extractive only.</strong>{" "}
                Like the rest of DocketLens, the widget never predicts
                outcomes or summarizes adjectivally. Every line restates
                what&apos;s on the docket.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">No tracking.</strong>{" "}
                We don&apos;t set cookies inside the iframe. The widget
                doesn&apos;t see who&apos;s reading your article.
              </li>
            </ul>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
