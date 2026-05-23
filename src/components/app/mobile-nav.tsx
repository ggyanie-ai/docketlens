"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/app/sidebar";
import { Wordmark } from "@/components/logo";
import Link from "next/link";

/* ============================================================================
 *  MobileNav — hamburger trigger + Sheet wrapping the SidebarContent.
 *  Only renders the hamburger below `md`; the Sheet itself is always mounted
 *  but invisible (transform off-screen) when closed.
 * ==========================================================================*/

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // Auto-close on route change as a safety net (link onClick handlers also call this)
  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors ring-focus"
      >
        <Menu className="size-4" />
      </button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        side="left"
        widthClass="w-[18rem]"
        label="App navigation"
      >
        <div className="flex h-14 items-center px-5 border-b border-[color:var(--color-border)]">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="ring-focus rounded"
          >
            <Wordmark />
          </Link>
        </div>
        <SidebarContent onNavigate={() => setOpen(false)} hideHeader />
      </Sheet>
    </>
  );
}
