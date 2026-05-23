import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium tracking-wide uppercase border tabular",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]",
        accent:
          "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-fg)] border-transparent",
        success:
          "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)] border-[color:var(--color-success)]/30",
        warning:
          "bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)] border-[color:var(--color-warning)]/30",
        danger:
          "bg-[color:var(--color-danger)]/12 text-[color:var(--color-danger)] border-[color:var(--color-danger)]/30",
        info:
          "bg-[color:var(--color-info)]/12 text-[color:var(--color-info)] border-[color:var(--color-info)]/30",
        outline:
          "bg-transparent text-[color:var(--color-fg-muted)] border-[color:var(--color-border-strong)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
