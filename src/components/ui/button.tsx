import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium ring-focus transition-[background-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[0.5px]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] hover:bg-[color:var(--color-fg)]/90",
        accent:
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:brightness-105 shadow-soft",
        primary:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:brightness-110",
        outline:
          "border border-[color:var(--color-border-strong)] bg-transparent text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]",
        ghost:
          "bg-transparent text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]",
        subtle:
          "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)]",
        link:
          "bg-transparent text-[color:var(--color-fg)] underline-offset-4 hover:underline px-0",
        danger:
          "bg-[color:var(--color-danger)] text-white hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-base",
        xl: "h-14 px-7 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { buttonVariants };
