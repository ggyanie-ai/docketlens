"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";

/* ============================================================================
 *  Sheet — controlled slide-in drawer.
 *
 *  - Side: left or right (left default for mobile nav).
 *  - Backdrop click + Esc close.
 *  - Body scroll-lock while open.
 *  - Returns focus to the trigger on close (caller responsibility — we just
 *    avoid stealing focus on unmount).
 *  - Pure CSS transitions via translate-x. No framer-motion to keep the
 *    main-thread cost zero for a path that's hit on every mobile session.
 * ==========================================================================*/

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  /** Set a max-width — defaults to 17rem (matches desktop sidebar width). */
  widthClass?: string;
  /** Optional aria-label for screen readers (the drawer itself). */
  label?: string;
  children: ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  side = "left",
  widthClass = "w-[17rem]",
  label = "Navigation drawer",
  children,
}: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Body scroll-lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute top-0 bottom-0 flex flex-col bg-[color:var(--color-bg)] border-[color:var(--color-border)] shadow-soft",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          widthClass,
          side === "left"
            ? cn(
                "left-0 border-r",
                open ? "translate-x-0" : "-translate-x-full"
              )
            : cn(
                "right-0 border-l",
                open ? "translate-x-0" : "translate-x-full"
              )
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors ring-focus"
        >
          <X className="size-4" />
        </button>
        {children}
      </aside>
    </div>
  );
}
