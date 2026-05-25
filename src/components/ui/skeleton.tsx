import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/* ============================================================================
 *  Skeleton — shimmer placeholder used by route-level loading.tsx files.
 *  Pure CSS animation (defined in globals.css as `animate-shimmer`); no JS.
 * ==========================================================================*/

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-[var(--radius-sm)] bg-[color:var(--color-bg-subtle)] relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-[color:var(--color-bg-elevated)]/70 before:to-transparent",
        // Shimmer is the eye-catching part — gate it on motion-safe so
        // prefers-reduced-motion users see a flat placeholder, not a
        // sweeping gradient. (The global @media in globals.css already
        // collapses it; this is belt-and-suspenders.)
        "motion-safe:before:animate-[dl-shimmer-once_1.4s_infinite]",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
  lastWidth = "70%",
}: {
  lines?: number;
  className?: string;
  lastWidth?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{
            width: i === lines - 1 ? lastWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}
