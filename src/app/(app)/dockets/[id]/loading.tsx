import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function DocketLoading() {
  return (
    <>
      <Topbar title="Case" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-3 w-32 mb-6" />

          <header className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Skeleton className="h-2.5 w-48" />
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-6 flex gap-2 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-36" />
              ))}
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Card className="overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative pl-12 pr-6 py-5 border-b border-[color:var(--color-border)] last:border-b-0"
                  >
                    <Skeleton className="absolute left-4 top-5 size-7 rounded-full" />
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Skeleton className="h-2.5 w-40" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </Card>
            </section>

            <aside className="flex flex-col gap-6">
              <Card className="p-5">
                <Skeleton className="h-2.5 w-16 mb-4" />
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="mt-1.5 h-2 w-20" />
                      <Skeleton className="mt-2 h-2.5 w-32" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <Skeleton className="h-2.5 w-16 mb-3" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-px w-full my-4" />
                <Skeleton className="h-2.5 w-20 mb-3" />
                <SkeletonText lines={3} lastWidth="50%" />
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
