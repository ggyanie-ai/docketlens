import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <>
      <Topbar title="Search" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-24" />
              <Skeleton className="h-11 w-20" />
            </div>
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <Skeleton className="h-2.5 w-14" />
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <Skeleton className="h-2.5 w-24" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-3 w-40" />
          </div>

          <Card className="overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-5"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-2.5 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <SkeletonText lines={2} className="mt-3" lastWidth="55%" />
              </div>
            ))}
          </Card>
        </div>
      </main>
    </>
  );
}
