import Link from "next/link";
import {
  Building2,
  Gavel,
  Briefcase,
  Scale,
  Shield,
  Search,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WATCHLIST_TEMPLATES,
  templateHref,
  type WatchlistTemplate,
} from "@/lib/watchlist-templates";

/* ============================================================================
 *  WatchlistSuggestions
 *
 *  Empty-state surface for /watchlists. Renders six prebuilt starter
 *  watchlists as deep-links to /watchlists/new with the form pre-filled.
 * ==========================================================================*/

const ICONS: Record<WatchlistTemplate["icon"], LucideIcon> = {
  building2: Building2,
  gavel: Gavel,
  briefcase: Briefcase,
  scale: Scale,
  shield: Shield,
  search: Search,
};

const TYPE_LABEL: Record<WatchlistTemplate["entityType"], string> = {
  party: "Party",
  attorney: "Attorney",
  judge: "Judge",
  lawfirm: "Law firm",
  case: "Case",
  term: "Term search",
};

export function WatchlistSuggestions() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1.5 inline-flex items-center gap-2">
            <Sparkles className="size-3 text-[color:var(--color-accent)]" />
            Suggested starters
          </p>
          <h2 className="font-serif text-2xl tracking-tight">
            Don&apos;t know what to watch yet?
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
            Six watchlists most teams set up on day one. Click one and the
            form will arrive pre-filled — you only have to confirm the name
            and pick a cadence.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WATCHLIST_TEMPLATES.map((t) => {
          const Icon = ICONS[t.icon];
          return (
            <Link
              key={t.id}
              href={templateHref(t) as never}
              className="group"
              aria-label={`Create watchlist: ${t.name}`}
            >
              <Card className="p-5 h-full flex flex-col gap-3 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-subtle)]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]">
                    <Icon className="size-4 text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] transition-colors" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {TYPE_LABEL[t.entityType]}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-serif text-lg tracking-tight leading-tight">
                    {t.name}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[color:var(--color-fg-muted)]">
                    {t.blurb}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-[color:var(--color-border)]">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    {t.approxMatches}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] inline-flex items-center gap-1">
                    Use template
                    <ArrowUpRight className="size-3" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
