import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-subtle)] px-1 font-mono text-[10px] text-[color:var(--color-fg-muted)]",
        className
      )}
      {...props}
    />
  );
}
