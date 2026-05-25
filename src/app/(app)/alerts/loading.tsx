import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function AlertsLoading() {
  return (
    <>
      <Topbar title="Alerts" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-8">
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-3 w-72" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="size-9 rounded-[var(--radius-md)]" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="mt-2 h-2.5 w-full" />
                  </div>
                  <Skeleton className="h-2.5 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-3 w-72" />
              </div>
              <Skeleton className="h-9 w-72" />
            </div>
            <Card className="overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-4"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-2.5 w-28" />
                    <Skeleton className="h-2.5 w-32 ml-auto" />
                  </div>
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <SkeletonText lines={2} lastWidth="60%" />
                </div>
              ))}
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
