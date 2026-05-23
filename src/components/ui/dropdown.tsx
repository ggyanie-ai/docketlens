"use client";

import { cn } from "@/lib/utils";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function Dropdown({
  trigger,
  children,
  align = "end",
  className,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, handleClick]);

  return (
    <div ref={ref} className="relative inline-block">
      <span onClick={() => setOpen((s) => !s)}>{trigger}</span>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1.5 min-w-[200px] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-soft p-1.5 animate-fade-in-up",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className,
  destructive,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm transition-colors",
        destructive
          ? "text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
          : "text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-[color:var(--color-border)]" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
      {children}
    </div>
  );
}
