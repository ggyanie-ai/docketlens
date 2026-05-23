import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-sm",
        "placeholder:text-[color:var(--color-fg-subtle)]",
        "ring-focus",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-sm",
        "placeholder:text-[color:var(--color-fg-subtle)]",
        "ring-focus resize-y",
        className
      )}
      {...props}
    />
  );
}
