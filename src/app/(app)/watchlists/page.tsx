import Link from "next/link";
import { PlusCircle, Bookmark, Bell, Pencil, ArrowUpRight } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { SAMPLE_WATCHLISTS } from "@/lib/sample-data";
import { WatchlistSuggestions } from "@/components/app/watchlist-suggestions";

const TYPE_LABEL: Record<string, string> = {
  party: "Party",
  attorney: "Attorney",
  judge: "Judge",
  lawfirm: "Law firm",
  case: "Case",
  term: "Term search",
};

export default async function WatchlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const sp = await searchParams;
  const isEmpty = sp.empty === "1";

  if (isEmpty) {
    return (
      <>
        <Topbar title="Watchlists" />
        <main id="main" className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="eyebrow">Empty-org preview</p>
              <Link
                href={"/watchlists" as never}
                className="text-xs font-mono text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] underline underline-offset-2"
              >
                ← back to populated view
              </Link>
            </div>

            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="display-2">No watchlists yet.</h1>
                <p className="mt-2 text-base text-[color:var(--color-fg-muted)] max-w-xl leading-relaxed">
                  Pick a starter below — it&apos;ll open the new-watchlist
                  form pre-filled — or build one from scratch.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={"/watchlists/new" as never}>
                  <PlusCircle className="size-4" />
                  Start from scratch
                </Link>
              </Button>
            </div>

            <WatchlistSuggestions />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Watchlists" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                {SAMPLE_WATCHLISTS.length} active · pooled CourtListener token ·
                next refresh in 24m
              </p>
            </div>
            <Button asChild variant="accent">
              <Link href={"/watchlists/new" as never}>
                <PlusCircle className="size-4" />
                New watchlist
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SAMPLE_WATCHLISTS.map((w) => (
              <Card key={w.id} className="p-6 flex flex-col gap-5 hover:border-[color:var(--color-border-strong)] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        w.color === "amber"
                          ? "size-2.5 rounded-full bg-[color:var(--color-accent)] mt-1"
                          : w.color === "navy"
                          ? "size-2.5 rounded-full bg-[color:var(--color-info)] mt-1"
                          : w.color === "emerald"
                          ? "size-2.5 rounded-full bg-[color:var(--color-success)] mt-1"
                          : "size-2.5 rounded-full bg-[color:var(--color-danger)] mt-1"
                      }
                    />
                    <div>
                      <h3 className="font-serif text-xl tracking-tight leading-tight">
                        {w.name}
                      </h3>
                      <p className="mt-1 text-xs text-[color:var(--color-fg-subtle)] uppercase tracking-[0.18em]">
                        {TYPE_LABEL[w.entityType]}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                </div>

                <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
                  {w.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] p-3">
                    <p className="font-serif text-2xl tabular leading-none">
                      {w.matches}
                    </p>
                    <p className="text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mt-1.5">
                      Total
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] p-3">
                    <p className="font-serif text-2xl tabular leading-none text-[color:var(--color-accent)]">
                      +{w.new24h}
                    </p>
                    <p className="text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)] mt-1.5">
                      Last 24h
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] p-3 flex flex-col">
                    <Bell className="size-4 text-[color:var(--color-fg-muted)]" />
                    <Badge variant="success" className="mt-auto self-start">
                      Daily
                    </Badge>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm">
                  <Link href={`/watchlists/${w.id}` as never}>
                    View matches
                    <ArrowUpRight className="size-3" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          <Empty
            icon={Bookmark}
            title="Watching all the right things?"
            body="Pro tier raises your limit from 5 to 50 watchlists, plus real-time alerts, BYO CourtListener token, and full AI summaries on every filing."
            action={
              <Button asChild variant="accent">
                <Link href={"/pricing" as never}>Upgrade to Pro</Link>
              </Button>
            }
            className="mt-4"
          />
        </div>
      </main>
    </>
  );
}
