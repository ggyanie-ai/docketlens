import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ============================================================================
 *  /audit-log loading skeleton
 *
 *  Mimics the real timeline shape: admin-notice banner, 4-up KPI strip,
 *  filter bar with tabs, and a 6-row chronological timeline. Pure CSS
 *  shimmer (motion-safe). Keeps cumulative-layout-shift to zero when the
 *  real page hydrates.
 * ==========================================================================*/

export default function AuditLogLoading() {
  return (
    <>
      <Topbar title="Audit log" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
          {/* Admin-notice banner */}
          <Card className="p-5 flex items-start gap-4">
            <Skeleton className="size-10 shrink-0 rounded-[var(--radius-md)]" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-3/4 max-w-sm" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </Card>

          {/* 4-up KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-none border-0 bg-[color:var(--color-bg)] p-5 flex flex-col gap-2"
              >
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-7 w-12 mt-1" />
                <Skeleton className="h-2.5 w-24 mt-1" />
              </Card>
            ))}
          </div>

          {/* Filter bar */}
          <Card className="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-md" />
              ))}
            </div>
          </Card>

          {/* Range chip row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-3 w-12" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>

          {/* Timeline */}
          <Card className="overflow-hidden">
            <ul>
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 px-5 py-4 flex items-start gap-4"
                >
                  <Skeleton className="size-9 shrink-0 rounded-[var(--radius-md)]" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-44 max-w-[60vw]" />
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-14 rounded-md" />
                      <Skeleton className="h-3 w-14 ml-auto" />
                    </div>
                    <Skeleton className="h-3 w-2/3 max-w-md" />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </>
  );
}
