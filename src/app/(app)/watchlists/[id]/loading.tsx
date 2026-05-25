import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistDetailLoading() {
  return (
    <>
      <Topbar title="Watchlist" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-3 w-28 mb-6" />

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-10 w-2/3 mb-3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-6 flex gap-2 flex-wrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-28" />
              ))}
            </div>
          </header>

          <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-none border-0 bg-[color:var(--color-bg)] p-5 flex flex-col gap-3"
              >
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-2.5 w-28" />
              </Card>
            ))}
          </section>

          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-3 w-32" />
          </div>

          <Card className="overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-5 py-4 border-b border-[color:var(--color-border)] last:border-b-0"
              >
                <div className="flex gap-4 items-start">
                  <Skeleton className="size-9 rounded-[var(--radius-md)] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-2.5 w-44" />
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="ml-auto h-2.5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-3/5 mb-2" />
                    <Skeleton className="h-2.5 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </>
  );
}
