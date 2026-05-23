"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/app/command-palette";
import { MobileNav } from "@/components/app/mobile-nav";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <MobileNav />
        <h1 className="font-serif text-lg sm:text-xl tracking-tight truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <CommandPalette />

        <button
          type="button"
          aria-label="Alerts"
          className="relative inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)] transition-colors"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
        </button>

        <ThemeToggle />

        <Dropdown
          align="end"
          trigger={
            <button
              type="button"
              aria-label="Account menu"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] p-1 hover:bg-[color:var(--color-bg-subtle)] transition-colors"
            >
              <Avatar name="GG" size={28} />
            </button>
          }
        >
          <DropdownLabel>Signed in as</DropdownLabel>
          <div className="px-2.5 pb-2 text-sm font-medium">
            ggyanie.ai@gmail.com
          </div>
          <DropdownSeparator />
          <DropdownItem>Account settings</DropdownItem>
          <DropdownItem>Billing</DropdownItem>
          <DropdownItem>API keys</DropdownItem>
          <DropdownSeparator />
          <DropdownItem>Documentation</DropdownItem>
          <DropdownItem>Keyboard shortcuts</DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive>Sign out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
