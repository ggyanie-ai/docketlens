"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Bookmark,
  Bell,
  Settings,
  KeyRound,
  Sparkles,
  Sun,
  Moon,
  FileText,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Kbd } from "@/components/ui/kbd";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(path: string) {
    router.push(path as never);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 h-9 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-subtle)] px-3 text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors min-w-[280px]"
        aria-label="Open command palette"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">
          Search cases, parties, judges…
        </span>
        <Kbd>⌘K</Kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[18vh] backdrop-blur-sm bg-black/40"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Command
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-soft overflow-hidden animate-fade-in-up"
              shouldFilter
            >
              <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] px-4">
                <Search className="size-4 text-[color:var(--color-fg-subtle)]" />
                <Command.Input
                  placeholder="Type a command, case, party, or page…"
                  className="flex-1 h-12 bg-transparent text-[15px] outline-none placeholder:text-[color:var(--color-fg-subtle)]"
                />
                <Kbd>esc</Kbd>
              </div>

              <Command.List className="max-h-[420px] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-sm text-[color:var(--color-fg-muted)]">
                  No results. Try a case name or docket number.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] px-2 pt-2 pb-1">
                  <Item
                    icon={LayoutDashboard}
                    label="Dashboard"
                    onSelect={() => go("/dashboard")}
                  />
                  <Item
                    icon={Search}
                    label="Search dockets"
                    onSelect={() => go("/search")}
                  />
                  <Item
                    icon={Bookmark}
                    label="Watchlists"
                    onSelect={() => go("/watchlists")}
                  />
                  <Item
                    icon={Bell}
                    label="Alerts"
                    onSelect={() => go("/alerts")}
                  />
                  <Item
                    icon={KeyRound}
                    label="API keys"
                    onSelect={() => go("/api-keys")}
                  />
                  <Item
                    icon={Settings}
                    label="Settings"
                    onSelect={() => go("/settings")}
                  />
                </Command.Group>

                <Command.Group heading="Cases" className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] px-2 pt-3 pb-1">
                  {SAMPLE_DOCKETS.map((d) => (
                    <Item
                      key={d.id}
                      icon={FileText}
                      label={d.caseName}
                      hint={`${d.court} · ${d.caseNumber}`}
                      onSelect={() => go(`/dockets/${d.id}`)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="Actions" className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] px-2 pt-3 pb-1">
                  <Item
                    icon={Sparkles}
                    label="New watchlist"
                    onSelect={() => go("/watchlists/new")}
                  />
                  <Item
                    icon={Sun}
                    label="Light mode"
                    onSelect={() => {
                      setTheme("light");
                      setOpen(false);
                    }}
                  />
                  <Item
                    icon={Moon}
                    label="Dark mode"
                    onSelect={() => {
                      setTheme("dark");
                      setOpen(false);
                    }}
                  />
                </Command.Group>
              </Command.List>

              <div className="border-t border-[color:var(--color-border)] px-3 py-2 flex items-center justify-between text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
                <span>
                  <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate
                </span>
                <span>
                  <Kbd>⏎</Kbd> to select
                </span>
                <span>
                  <Kbd>⌘K</Kbd> to toggle
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}

function Item({
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  icon: typeof FileText;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={`${label} ${hint ?? ""}`}
      onSelect={onSelect}
      className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm cursor-pointer aria-selected:bg-[color:var(--color-bg-subtle)] hover:bg-[color:var(--color-bg-subtle)]/60"
    >
      <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] truncate max-w-[40%]">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
