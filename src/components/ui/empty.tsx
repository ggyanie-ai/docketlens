import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Empty({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-subtle)]/40 px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)]">
          <Icon className="size-5 text-[color:var(--color-fg-muted)]" />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-md">
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
        {body && (
          <p className="text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
            {body}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
