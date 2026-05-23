"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Bell,
  KeyRound,
  Settings,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search dockets", icon: Search, kbd: "S" },
  { href: "/watchlists", label: "Watchlists", icon: Bookmark, badge: "4" },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: "12" },
  { href: "/api-keys", label: "API keys", icon: KeyRound, pro: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  /** Called whenever a nav link is activated. Sheet uses this to auto-close. */
  onNavigate?: () => void;
  /** Hide the wordmark/header — useful when the sheet provides its own. */
  hideHeader?: boolean;
}

export function SidebarContent({ onNavigate, hideHeader }: SidebarContentProps) {
  const path = usePathname();
  return (
    <>
      {!hideHeader && (
        <div className="flex h-14 items-center px-5 border-b border-[color:var(--color-border)]">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="ring-focus rounded"
          >
            <Wordmark />
          </Link>
        </div>
      )}

      <div className="px-3 py-3">
        <Button asChild variant="accent" size="md" className="w-full justify-start">
          <Link href={"/watchlists/new" as never} onClick={onNavigate}>
            <PlusCircle className="size-4" />
            New watchlist
            <Kbd className="ml-auto">N</Kbd>
          </Link>
        </Button>
      </div>

      <nav className="flex-1 px-2 py-1 overflow-y-auto" aria-label="App">
        <p className="px-3 pt-2 pb-1.5 eyebrow">Menu</p>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = path === item.href || path?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href as never}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg)]"
                      : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]/60"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      active
                        ? "text-[color:var(--color-accent)]"
                        : "text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-fg-muted)]"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                  {item.pro && (
                    <Badge variant="accent" className="text-[10px]">
                      PRO
                    </Badge>
                  )}
                  {item.kbd && (
                    <Kbd className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.kbd}
                    </Kbd>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 pt-5 pb-1.5 eyebrow">Pinned watchlists</p>
        <ul className="flex flex-col gap-0.5">
          {[
            { label: "Apple Inc.", color: "amber", n: 3 },
            { label: "Hon. Alsup", color: "navy", n: 5 },
            { label: "Kirkland & Ellis", color: "emerald", n: 9 },
            { label: "Securities — S.D.N.Y.", color: "rose", n: 7 },
          ].map((w) => (
            <li key={w.label}>
              <Link
                href={"/watchlists" as never}
                onClick={onNavigate}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]/60 transition-colors"
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    w.color === "amber" && "bg-[color:var(--color-accent)]",
                    w.color === "navy" && "bg-[color:var(--color-info)]",
                    w.color === "emerald" && "bg-[color:var(--color-success)]",
                    w.color === "rose" && "bg-[color:var(--color-danger)]"
                  )}
                />
                <span className="flex-1 truncate">{w.label}</span>
                <span className="text-[10.5px] font-mono text-[color:var(--color-fg-subtle)]">
                  +{w.n}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--color-border)] p-3">
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] p-3">
          <p className="eyebrow mb-1">Free plan</p>
          <p className="text-xs leading-relaxed text-[color:var(--color-fg-muted)]">
            5 watches · 7-day history · daily digest.
          </p>
          <Button asChild variant="default" size="sm" className="mt-3 w-full">
            <Link href={"/pricing" as never} onClick={onNavigate}>
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

/** Desktop sidebar — hidden on screens narrower than `md`. */
export function Sidebar() {
  return (
    <aside className="hidden md:flex h-dvh w-60 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
      <SidebarContent />
    </aside>
  );
}
