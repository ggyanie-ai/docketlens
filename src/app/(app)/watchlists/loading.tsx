import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistsLoading() {
  return (
    <>
      <Topbar title="Watchlists" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-10 w-36" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-2.5 rounded-full mt-1" />
                    <div>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="mt-2 h-2 w-20" />
                    </div>
                  </div>
                  <Skeleton className="size-9 rounded-[var(--radius-md)]" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-3/4" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </div>
                <Skeleton className="h-9 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
