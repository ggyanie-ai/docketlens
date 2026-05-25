import Link from "next/link";
import {
  Command,
  Keyboard as KeyboardIcon,
  Search as SearchIcon,
  Bookmark,
  Bell,
  Inbox,
  LayoutDashboard,
  FileText,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Keyboard shortcuts",
  description:
    "Every keyboard shortcut in DocketLens — global, navigation, search, docket detail, and inbox.",
};

interface Shortcut {
  keys: (string | { chord: string[] })[]; // ["⌘", "K"] or [{ chord: ["G", "D"] }]
  label: string;
  detail?: string;
  shipped?: boolean; // false → "coming soon"
}

interface Section {
  title: string;
  icon: typeof KeyboardIcon;
  blurb: string;
  shortcuts: Shortcut[];
}

const SECTIONS: Section[] = [
  {
    title: "Global",
    icon: Command,
    blurb: "Work everywhere in the app and most marketing pages.",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Open command palette", detail: "Or Ctrl + K on Windows / Linux." },
      { keys: ["Esc"], label: "Close the active dialog / drawer / popover" },
      { keys: ["?"], label: "Open this shortcuts reference", shipped: false },
      { keys: ["⌘", "/"], label: "Toggle the sidebar (desktop)", shipped: false },
    ],
  },
  {
    title: "Navigation (press G, then a letter)",
    icon: LayoutDashboard,
    blurb: "Vim-style two-key chords. Press G first, release, then the second key within ~1.5s.",
    shortcuts: [
      { keys: [{ chord: ["G", "D"] }], label: "Go to Dashboard", shipped: false },
      { keys: [{ chord: ["G", "S"] }], label: "Go to Search", shipped: false },
      { keys: [{ chord: ["G", "W"] }], label: "Go to Watchlists", shipped: false },
      { keys: [{ chord: ["G", "A"] }], label: "Go to Alerts", shipped: false },
      { keys: [{ chord: ["G", "I"] }], label: "Go to Inbox", shipped: false },
      { keys: [{ chord: ["G", "P"] }], label: "Go to Pricing", shipped: false },
    ],
  },
  {
    title: "Search",
    icon: SearchIcon,
    blurb: "Once you're on /search or have the command palette open.",
    shortcuts: [
      { keys: ["⌘", "Enter"], label: "Run the current query", shipped: false },
      { keys: ["⌘", "S"], label: "Save the current search", shipped: false },
      { keys: ["N"], label: "Create a new watchlist from this query", shipped: false },
      { keys: ["⌘", "E"], label: "Export the current results to CSV", shipped: false },
      { keys: ["1"], label: "Filter scope: All" },
      { keys: ["2"], label: "Filter scope: Patent", shipped: false },
      { keys: ["3"], label: "Filter scope: Securities", shipped: false },
      { keys: ["4"], label: "Filter scope: Antitrust", shipped: false },
    ],
  },
  {
    title: "Docket detail",
    icon: FileText,
    blurb: "While viewing a case at /dockets/[id].",
    shortcuts: [
      { keys: ["J"], label: "Next docket entry", shipped: false },
      { keys: ["K"], label: "Previous docket entry", shipped: false },
      { keys: ["Enter"], label: "Expand the selected entry's full text", shipped: false },
      { keys: ["W"], label: "Watch this case", shipped: false },
      { keys: ["E"], label: "Generate AI exec summary", shipped: false },
      { keys: ["S"], label: "Share — copies a deep link to the entry", shipped: false },
    ],
  },
  {
    title: "Watchlists",
    icon: Bookmark,
    blurb: "On /watchlists and the per-list detail pages.",
    shortcuts: [
      { keys: ["N"], label: "New watchlist" },
      { keys: ["P"], label: "Pause / unpause the active watchlist", shipped: false },
      { keys: ["Del"], label: "Delete (confirm prompt)", shipped: false },
    ],
  },
  {
    title: "Inbox",
    icon: Inbox,
    blurb: "Email-style two-pane reading view.",
    shortcuts: [
      { keys: ["J"], label: "Next message", shipped: false },
      { keys: ["K"], label: "Previous message", shipped: false },
      { keys: ["U"], label: "Mark unread", shipped: false },
      { keys: ["E"], label: "Archive", shipped: false },
      { keys: ["Enter"], label: "Open the linked case", shipped: false },
      { keys: ["⌘", "Shift", "U"], label: "Mark all read", shipped: false },
    ],
  },
  {
    title: "Alerts",
    icon: Bell,
    blurb: "On /alerts.",
    shortcuts: [
      { keys: ["A"], label: "Add a new channel", shipped: false },
      { keys: ["F"], label: "Cycle filter tab (All → Sent → Failed → Queued)", shipped: false },
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-20 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <p className="eyebrow">Reference</p>
            <Badge variant="outline">keyboard-first</Badge>
          </div>
          <h1 className="display-1">
            Every shortcut, on{" "}
            <span className="italic text-[color:var(--color-accent)]">
              one page.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            DocketLens is built for keyboard-first power users — attorneys
            and journalists who don&apos;t want to lift their hands off the
            home row to find a case. Anything you can do with the mouse,
            you can do faster with one of these.
          </p>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-fg-muted)]">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span>opens the command palette anywhere</span>
            </span>
          </div>
        </section>

        {/* Legend */}
        <section className="mx-auto max-w-5xl px-6 pb-10">
          <Card className="p-5 flex items-start gap-3 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <KeyboardIcon className="size-4 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
            <div className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              <span className="font-medium text-[color:var(--color-fg)]">
                On the legend.
              </span>{" "}
              <Kbd>⌘</Kbd> means Cmd on macOS, Ctrl on Windows + Linux. A
              chord like <Kbd>G</Kbd> <Kbd>D</Kbd> means press G, release,
              then press D within about 1.5 seconds. Shortcuts marked{" "}
              <Badge variant="outline" className="text-[10px] ml-1">
                planned
              </Badge>{" "}
              aren&apos;t wired yet — they ship as the product matures, and
              this page is the spec we&apos;re building against.
            </div>
          </Card>
        </section>

        {/* Sections */}
        <section className="mx-auto max-w-5xl px-6 pb-20 flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="overflow-hidden">
              <header className="px-6 py-5 border-b border-[color:var(--color-border)] flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shrink-0">
                  <s.icon className="size-4 text-[color:var(--color-fg-muted)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-xl tracking-tight">
                    {s.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                    {s.blurb}
                  </p>
                </div>
                <span className="ml-auto font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                  {s.shortcuts.length} shortcut
                  {s.shortcuts.length === 1 ? "" : "s"}
                </span>
              </header>
              <ul>
                {s.shortcuts.map((sc, i) => (
                  <li
                    key={`${s.title}-${i}`}
                    className="px-6 py-3 border-b border-[color:var(--color-border)] last:border-b-0 flex items-center gap-4 hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors"
                  >
                    <KeyCombo combo={sc.keys} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-tight">
                        {sc.label}
                        {sc.shipped === false && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] align-middle"
                          >
                            planned
                          </Badge>
                        )}
                      </p>
                      {sc.detail && (
                        <p className="mt-0.5 text-[11.5px] text-[color:var(--color-fg-subtle)] leading-relaxed">
                          {sc.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="font-serif text-2xl tracking-tight">
            Want a shortcut we haven&apos;t built yet?
          </h2>
          <p className="mt-3 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
            We treat this page as the spec. If you&apos;d use one, tell us —
            most ship within a release.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="lg">
              <Link href={"/contact?topic=general" as never}>
                Request a shortcut
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={"/dashboard" as never}>Back to dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function KeyCombo({ combo }: { combo: Shortcut["keys"] }) {
  return (
    <div className="flex items-center gap-1 shrink-0 min-w-[110px]">
      {combo.map((k, i) => {
        if (typeof k === "string") {
          return (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && (
                <span
                  aria-hidden
                  className="text-[10px] text-[color:var(--color-fg-subtle)]"
                >
                  +
                </span>
              )}
              <Kbd>{k}</Kbd>
            </span>
          );
        }
        // chord: ["G", "D"] → renders as Kbd G then arrow then Kbd D
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1"
            aria-label={`Press ${k.chord.join(" then ")}`}
          >
            {k.chord.map((c, j) => (
              <span key={`${j}-${c}`} className="inline-flex items-center gap-1">
                {j > 0 && (
                  <span
                    aria-hidden
                    className="text-[10px] text-[color:var(--color-fg-subtle)]"
                  >
                    →
                  </span>
                )}
                <Kbd>{c}</Kbd>
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
}
