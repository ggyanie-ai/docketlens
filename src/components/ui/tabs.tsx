"use client";

import { cn } from "@/lib/utils";
import { createContext, type ReactNode, useContext, useState } from "react";

const Ctx = createContext<{
  value: string;
  set: (v: string) => void;
} | null>(null);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const v = value ?? internal;
  const set = (nv: string) => {
    setInternal(nv);
    onValueChange?.(nv);
  };
  return (
    <Ctx.Provider value={{ value: v, set }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.set(value)}
      className={cn(
        "inline-flex h-7 items-center rounded-[var(--radius-sm)] px-3 text-xs font-medium transition-colors",
        active
          ? "bg-[color:var(--color-bg)] text-[color:var(--color-fg)] shadow-soft"
          : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
