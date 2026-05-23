import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
          {/* KPI strip */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="rounded-none border-0 bg-[color:var(--color-bg)] p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="size-4 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-9 w-16" />
                  <Skeleton className="mt-3 h-2.5 w-32" />
                </Card>
              ))}
            </div>
          </section>

          {/* Chart + watchlists */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="mt-2 h-2.5 w-64" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
              <Skeleton className="mt-6 h-44 w-full" />
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="mt-2 h-2.5 w-48" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <Skeleton className="size-2 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="mt-1.5 h-2 w-16" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Heatmap */}
          <section>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="mt-2 h-2.5 w-72" />
                </div>
                <Skeleton className="h-9 w-72" />
              </div>
              <Skeleton className="h-[252px] w-full rounded-md" />
            </Card>
          </section>

          {/* Leaderboard */}
          <section>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="mt-2 h-2.5 w-64" />
                </div>
                <Skeleton className="h-9 w-72" />
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1.4rem_minmax(0,1fr)_120px_56px_44px] items-center gap-3">
                    <Skeleton className="h-3 w-5" />
                    <div>
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="mt-1.5 h-2 w-24" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <Skeleton className="h-4 w-10 justify-self-end" />
                    <Skeleton className="h-3 w-8 justify-self-end" />
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Recent filings */}
          <section>
            <div className="mb-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-3 w-72" />
            </div>
            <Card className="overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-4 flex gap-4"
                >
                  <Skeleton className="size-9 shrink-0 rounded-[var(--radius-md)]" />
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Skeleton className="h-2.5 w-32" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-3/4" />
                    <SkeletonText lines={2} className="mt-2" lastWidth="60%" />
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
