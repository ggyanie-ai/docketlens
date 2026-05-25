"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Inbox,
  Sparkles,
  Archive,
  Bookmark,
  CheckCheck,
  ExternalLink,
  Mail,
  MailOpen,
  Bell,
  FileText,
  Gavel,
  Scale,
  AlertTriangle,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { cn, timeAgo } from "@/lib/utils";
import { SAMPLE_INBOX, type InboxMessage, type InboxStatus } from "@/lib/sample-inbox";

/* ============================================================================
 *  /inbox — in-app alert center
 *
 *  Email-style two-pane layout. Left: chronological list grouped by
 *  read-state, with click-to-select. Right: full detail of the selected
 *  message including the AI summary, watchlist source, and a deep link to
 *  the docket entry. Toolbar supports bulk Mark-all-read + status filter
 *  tabs (All / Unread / Read / Archived).
 * ==========================================================================*/

const FILING_ICON: Record<string, typeof FileText> = {
  Complaint: FileText,
  Motion: Gavel,
  Order: Scale,
  Notice: AlertTriangle,
  Brief: Building2,
  Verdict: Scale,
  Stipulation: FileText,
};

const COLOR_DOT: Record<string, string> = {
  amber: "bg-[color:var(--color-accent)]",
  navy: "bg-[color:var(--color-info)]",
  emerald: "bg-[color:var(--color-success)]",
  rose: "bg-[color:var(--color-danger)]",
};

type Filter = "all" | "unread" | "read" | "archived";

export default function InboxPage() {
  const searchParams = useSearchParams();
  const isEmpty = searchParams.get("empty") === "1";
  const initial = isEmpty ? [] : SAMPLE_INBOX;
  const [messages, setMessages] = useState<InboxMessage[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null
  );

  if (isEmpty && messages.length === 0) {
    return (
      <>
        <Topbar title="Inbox" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
            <div className="flex justify-center mb-5">
              <span className="relative inline-flex">
                <span
                  aria-hidden
                  className="motion-safe:animate-ping motion-reduce:hidden absolute inset-0 inline-flex rounded-full bg-[color:var(--color-accent)] opacity-40"
                />
                <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft">
                  <Inbox className="size-6" />
                </span>
              </span>
            </div>
            <p className="eyebrow mb-2">Inbox · empty-org preview</p>
            <h1 className="display-2">No alerts yet.</h1>
            <p className="mt-5 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-xl mx-auto">
              Once you have an active watchlist with a matching filing, the
              first alert lands here within seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="accent" size="lg">
                <Link href={"/watchlists?empty=1" as never}>
                  Send your first alert
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={"/inbox" as never}>Back to populated view</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const filtered = useMemo(() => {
    if (filter === "all") {
      return messages.filter((m) => m.status !== "archived");
    }
    return messages.filter((m) => m.status === filter);
  }, [messages, filter]);

  const selected =
    messages.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const archivedCount = messages.filter((m) => m.status === "archived").length;

  function setStatus(id: string, status: InboxStatus) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }

  function markAllRead() {
    let changed = 0;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.status === "unread") {
          changed++;
          return { ...m, status: "read" };
        }
        return m;
      })
    );
    if (changed) {
      toast.success(`Marked ${changed} as read`);
    } else {
      toast("Nothing to mark", { description: "No unread messages." });
    }
  }

  function selectMessage(m: InboxMessage) {
    setSelectedId(m.id);
    if (m.status === "unread") {
      setStatus(m.id, "read");
    }
  }

  // Gmail-style keyboard bindings. `e` archives the currently-selected
  // message; `j` / `k` (or arrows) walk through the filtered list.
  // Skipped inside inputs / contenteditable so typing isn't hijacked.
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const editable =
        tag === "input" ||
        tag === "textarea" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (editable) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

      const list = filtered;
      if (list.length === 0) return;
      const currentIdx = selected
        ? list.findIndex((m) => m.id === selected.id)
        : -1;

      if (ev.key === "e") {
        if (!selected) return;
        ev.preventDefault();
        setStatus(selected.id, "archived");
        toast.success("Archived", { description: selected.subject });
        // Auto-advance to next message so the user can blow through a stack
        const next = list[currentIdx + 1] ?? list[currentIdx - 1] ?? null;
        if (next) setSelectedId(next.id);
        return;
      }
      if (ev.key === "j" || ev.key === "ArrowDown") {
        ev.preventDefault();
        const next = list[Math.min(currentIdx + 1, list.length - 1)] ?? list[0];
        if (next) selectMessage(next);
        return;
      }
      if (ev.key === "k" || ev.key === "ArrowUp") {
        ev.preventDefault();
        if (currentIdx > 0) selectMessage(list[currentIdx - 1]);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // selectMessage + setStatus capture state via closure each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <>
      <Topbar title="Inbox" />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-7xl px-6 py-6 flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                <Inbox className="size-4 text-[color:var(--color-fg-muted)]" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">
                  In-app inbox
                </p>
                <p className="text-xs text-[color:var(--color-fg-muted)]">
                  {unreadCount > 0
                    ? `${unreadCount} unread · ${messages.length} total`
                    : `${messages.length} total · all read`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] text-[10px] font-mono tabular px-1.5 min-w-4">
                        {unreadCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                  <TabsTrigger value="archived">
                    Archived
                    {archivedCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] text-[10px] font-mono tabular px-1.5 min-w-4">
                        {archivedCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            </div>
          </div>

          {/* Two-pane body */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 flex-1 min-h-0">
            {/* List */}
            <Card className="overflow-hidden flex flex-col">
              {filtered.length === 0 ? (
                <Empty
                  icon={Inbox}
                  title={
                    filter === "unread"
                      ? "Inbox zero"
                      : filter === "archived"
                      ? "No archived messages"
                      : "No messages"
                  }
                  body={
                    filter === "unread"
                      ? "Nothing new since you last looked. Take a walk."
                      : "Matches appear here as your watchlists fire."
                  }
                  className="m-3"
                />
              ) : (
                <ul className="overflow-y-auto">
                  {filtered.map((m) => {
                    const Icon = FILING_ICON[m.filingType] ?? FileText;
                    const isActive = m.id === selected?.id;
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          "border-b border-[color:var(--color-border)] last:border-b-0 transition-colors",
                          isActive
                            ? "bg-[color:var(--color-bg-subtle)]"
                            : "hover:bg-[color:var(--color-bg-subtle)]/40"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => selectMessage(m)}
                          aria-current={isActive ? "true" : undefined}
                          className="block w-full text-left px-4 py-3.5 ring-focus"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0 mt-0.5">
                              <div className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-[color:var(--color-bg)] border border-[color:var(--color-border)]">
                                <Icon className="size-3.5 text-[color:var(--color-fg-muted)]" />
                              </div>
                              {m.status === "unread" && (
                                <span
                                  aria-hidden
                                  className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[color:var(--color-accent)] ring-2 ring-[color:var(--color-bg-elevated)]"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full shrink-0",
                                    COLOR_DOT[m.watchlistColor] ??
                                      "bg-[color:var(--color-accent)]"
                                  )}
                                />
                                <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)] truncate">
                                  {m.watchlistName}
                                </span>
                                <span className="ml-auto font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                                  {timeAgo(m.receivedAt)}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  "mt-1 text-[13px] truncate",
                                  m.status === "unread"
                                    ? "font-semibold text-[color:var(--color-fg)]"
                                    : "text-[color:var(--color-fg)]"
                                )}
                              >
                                {m.caseName}
                              </p>
                              <p className="mt-0.5 text-[12px] text-[color:var(--color-fg-muted)] truncate">
                                {m.subject}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Detail */}
            <Card className="flex flex-col overflow-hidden">
              {!selected ? (
                <Empty
                  icon={Inbox}
                  title="Select a message"
                  body="Pick one from the list to read it here."
                  className="m-6"
                />
              ) : (
                <InboxDetail
                  message={selected}
                  onArchive={() => {
                    setStatus(selected.id, "archived");
                    toast("Archived", {
                      description: "Find it under the Archived tab.",
                    });
                  }}
                  onMarkUnread={() => {
                    setStatus(selected.id, "unread");
                  }}
                />
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function InboxDetail({
  message,
  onArchive,
  onMarkUnread,
}: {
  message: InboxMessage;
  onArchive: () => void;
  onMarkUnread: () => void;
}) {
  const Icon = FILING_ICON[message.filingType] ?? FileText;
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-[color:var(--color-border)] p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            <Bell className="size-3" />
            {message.watchlistName}
          </Badge>
          <Badge variant="accent">
            <Sparkles className="size-3" />
            AI summary
          </Badge>
          <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
            {new Date(message.receivedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <h2 className="font-serif text-2xl tracking-tight leading-tight">
          {message.caseName}
        </h2>
        <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
          {message.court} · {message.caseNumber}
        </p>
      </header>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
            <Icon className="size-4 text-[color:var(--color-fg-muted)]" />
          </div>
          <div>
            <p className="text-sm font-medium">{message.filingType}</p>
            <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
              Triggered by {message.watchlistName}
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/30 p-4 mt-4">
          <p className="eyebrow mb-1.5">
            <Sparkles className="inline size-3 mr-1 -translate-y-px" />
            One-line summary
          </p>
          <p className="text-[15px] leading-snug font-serif text-[color:var(--color-fg)]">
            {message.body}
          </p>
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
          DocketLens cached this filing and matched it against your{" "}
          <Link
            href={`/watchlists/${message.watchlistId}` as never}
            className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
          >
            {message.watchlistName}
          </Link>{" "}
          watchlist. Open the case to read the full docket entry, generate
          a paragraph or executive-brief summary, or jump to related
          filings.
        </p>
      </div>

      <footer className="border-t border-[color:var(--color-border)] p-4 flex items-center gap-2 flex-wrap">
        <Button asChild variant="accent" size="sm">
          <Link href={`/dockets/${message.docketId}#${message.entryId}` as never}>
            <ExternalLink className="size-3.5" />
            Open case
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onMarkUnread}>
          <MailOpen className="size-3.5" />
          Mark unread
        </Button>
        <Button variant="outline" size="sm" onClick={onArchive}>
          <Archive className="size-3.5" />
          Archive
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link href={`/watchlists/${message.watchlistId}` as never}>
            View watchlist
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
