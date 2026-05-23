"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Bell,
  Inbox,
  KeyRound,
  Settings,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, Wordmark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

const STORAGE_KEY = "dl-sidebar-collapsed";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search dockets", icon: Search, kbd: "S" },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: "4" },
  { href: "/watchlists", label: "Watchlists", icon: Bookmark, badge: "4" },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: "12" },
  { href: "/api-keys", label: "API keys", icon: KeyRound, pro: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PINNED = [
  { label: "Apple Inc.", color: "amber", n: 3 },
  { label: "Hon. Alsup", color: "navy", n: 5 },
  { label: "Kirkland & Ellis", color: "emerald", n: 9 },
  { label: "Securities — S.D.N.Y.", color: "rose", n: 7 },
];

interface SidebarContentProps {
  /** Called whenever a nav link is activated. Sheet uses this to auto-close. */
  onNavigate?: () => void;
  /** Hide the wordmark/header — useful when the sheet provides its own. */
  hideHeader?: boolean;
  /** Render in icon-only collapsed mode (desktop only). Mobile sheet always = false. */
  collapsed?: boolean;
}

export function SidebarContent({
  onNavigate,
  hideHeader,
  collapsed = false,
}: SidebarContentProps) {
  const path = usePathname();

  return (
    <>
      {!hideHeader && (
        <div
          className={cn(
            "flex h-14 items-center border-b border-[color:var(--color-border)]",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="ring-focus rounded"
            aria-label="DocketLens — go to dashboard"
          >
            {collapsed ? <Logo size={22} /> : <Wordmark />}
          </Link>
        </div>
      )}

      <div className={cn(collapsed ? "px-2 py-3" : "px-3 py-3")}>
        {collapsed ? (
          <Link
            href={"/watchlists/new" as never}
            onClick={onNavigate}
            title="New watchlist"
            aria-label="New watchlist"
            className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:brightness-105 ring-focus shadow-soft mx-auto"
          >
            <PlusCircle className="size-4" />
          </Link>
        ) : (
          <Button
            asChild
            variant="accent"
            size="md"
            className="w-full justify-start"
          >
            <Link href={"/watchlists/new" as never} onClick={onNavigate}>
              <PlusCircle className="size-4" />
              New watchlist
              <Kbd className="ml-auto">N</Kbd>
            </Link>
          </Button>
        )}
      </div>

      <nav
        className={cn("flex-1 overflow-y-auto", collapsed ? "px-2" : "px-2 py-1")}
        aria-label="App"
      >
        {!collapsed && <p className="px-3 pt-2 pb-1.5 eyebrow">Menu</p>}

        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = path === item.href || path?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href as never}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative rounded-[var(--radius-sm)] transition-colors",
                    collapsed
                      ? "flex size-9 items-center justify-center mx-auto"
                      : "flex items-center gap-2.5 px-3 py-1.5 text-sm",
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
                  {!collapsed && (
                    <>
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
                    </>
                  )}
                  {/* Collapsed-mode badge dot */}
                  {collapsed && (item.badge || item.pro) && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1.5 right-1.5 size-1.5 rounded-full",
                        item.pro
                          ? "bg-[color:var(--color-accent)]"
                          : "bg-[color:var(--color-info)]"
                      )}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <p className="px-3 pt-5 pb-1.5 eyebrow">Pinned watchlists</p>
        )}
        {collapsed && (
          <div className="my-3 mx-2 h-px bg-[color:var(--color-border)]" />
        )}

        <ul className="flex flex-col gap-0.5">
          {PINNED.map((w) => (
            <li key={w.label}>
              <Link
                href={"/watchlists" as never}
                onClick={onNavigate}
                title={collapsed ? `${w.label} · +${w.n}` : undefined}
                aria-label={collapsed ? `${w.label}, ${w.n} new` : undefined}
                className={cn(
                  "rounded-[var(--radius-sm)] transition-colors",
                  collapsed
                    ? "flex size-9 items-center justify-center mx-auto"
                    : "flex items-center gap-2.5 px-3 py-1.5 text-sm",
                  "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-subtle)]/60"
                )}
              >
                <span
                  className={cn(
                    "rounded-full shrink-0",
                    collapsed ? "size-2" : "size-1.5",
                    w.color === "amber" && "bg-[color:var(--color-accent)]",
                    w.color === "navy" && "bg-[color:var(--color-info)]",
                    w.color === "emerald" && "bg-[color:var(--color-success)]",
                    w.color === "rose" && "bg-[color:var(--color-danger)]"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{w.label}</span>
                    <span className="text-[10.5px] font-mono text-[color:var(--color-fg-subtle)]">
                      +{w.n}
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={cn(
          "border-t border-[color:var(--color-border)]",
          collapsed ? "p-2" : "p-3"
        )}
      >
        {collapsed ? (
          <Link
            href={"/pricing" as never}
            onClick={onNavigate}
            title="Upgrade to Pro"
            aria-label="Upgrade to Pro"
            className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors ring-focus mx-auto"
          >
            <Sparkles className="size-4 text-[color:var(--color-accent)]" />
          </Link>
        ) : (
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
        )}
      </div>
    </>
  );
}

/** Desktop sidebar — hidden on screens narrower than `md`. Persists its
 *  collapsed state to localStorage and animates the width transition. */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable — keep default
    }
    setHydrated(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex h-dvh shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-bg)] relative",
        hydrated && "transition-[width] duration-200 ease-out",
        collapsed ? "w-14" : "w-60"
      )}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <SidebarContent collapsed={collapsed} />

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-16 z-10 inline-flex size-6 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg-muted)] shadow-soft hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-accent)] transition-colors ring-focus"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-3" />
        ) : (
          <PanelLeftClose className="size-3" />
        )}
      </button>
    </aside>
  );
}
