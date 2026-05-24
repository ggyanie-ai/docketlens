import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

/* ============================================================================
 *  Lightweight native `<select>` styled to match Input.
 *  Wrapped so we can drop in a chevron and consistent focus ring.
 * ==========================================================================*/

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-9 w-full appearance-none rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] pl-3 pr-9 py-2 text-sm",
          "text-[color:var(--color-fg)]",
          "ring-focus transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)] pointer-events-none"
      />
    </div>
  );
}
