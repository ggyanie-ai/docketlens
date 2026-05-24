import Link from "next/link";
import { ArrowUpRight, ExternalLink, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";
import { widgetTopDockets, widgetTotal } from "@/lib/widget-pings";

/* ============================================================================
 *  Widget impressions card
 *
 *  Surfaces the privacy-preserving aggregate counts collected via
 *  /api/widget-ping. Shows the five most-loaded embeds in the last 7 days
 *  and the grand total across the last 30. Nothing in this card is
 *  per-person — only docket × day rollups.
 *
 *  Empty-state: explains the embeddable widget and links to /widget so the
 *  user can copy a snippet.
 * ==========================================================================*/

const SAMPLE_BY_ID = new Map(SAMPLE_DOCKETS.map((d) => [d.id, d]));

export async function WidgetImpressionsCard() {
  const [top, total30] = await Promise.all([
    widgetTopDockets(7, 5),
    widgetTotal(30),
  ]);

  const max = Math.max(1, ...top.map((t) => t.total));

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4 flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-sm inline-flex items-center gap-2">
            <Eye className="size-3.5 text-[color:var(--color-fg-subtle)]" />
            Your embeds — last 7 days
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Aggregate impressions from{" "}
            <Link
              href={"/widget" as never}
              className="underline underline-offset-2 hover:text-[color:var(--color-fg)]"
            >
              embedded case widgets
            </Link>
            . No IP, UA, or cookies — just docket × day.
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={"/widget" as never}>
            Embed a case
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>

      {top.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40 p-6 text-center">
          <p className="font-serif text-lg">
            No embed impressions yet.
          </p>
          <p className="mt-1.5 text-xs text-[color:var(--color-fg-muted)] max-w-md mx-auto leading-relaxed">
            Drop a DocketLens case into any article or blog post with one
            iframe tag. As soon as readers load it, you&apos;ll see
            per-docket impression counts here — without us logging anything
            about who they are.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={"/widget" as never}>
              See embed snippets
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex flex-col">
            {top.map((row) => {
              const d = SAMPLE_BY_ID.get(row.docketId);
              const pct = (row.total / max) * 100;
              return (
                <li
                  key={row.docketId}
                  className="border-t border-[color:var(--color-border)] py-3 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {d?.caseNameShort ?? row.docketId}
                      </p>
                      <p className="text-[11px] text-[color:var(--color-fg-subtle)] truncate font-mono">
                        {d ? `${d.court} · ${d.caseNumber}` : row.docketId}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm tabular font-mono">{row.total}</p>
                      <p className="text-[10.5px] text-[color:var(--color-fg-subtle)] font-mono uppercase tracking-wider">
                        loads
                      </p>
                    </div>
                    <Link
                      href={`/widget/${row.docketId}` as never}
                      target="_blank"
                      aria-label={`Open ${d?.caseNameShort ?? row.docketId} widget`}
                      className="ml-1 text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                  <div
                    className="mt-2 h-1 w-full rounded-full bg-[color:var(--color-bg-subtle)] overflow-hidden"
                    aria-hidden
                  >
                    <div
                      className="h-full bg-[color:var(--color-accent)]/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-border)] pt-4">
            <p className="text-xs text-[color:var(--color-fg-muted)]">
              Grand total · last 30 days
            </p>
            <Badge variant="outline" className="font-mono">
              {total30.toLocaleString()} loads
            </Badge>
          </div>
        </>
      )}
    </Card>
  );
}
