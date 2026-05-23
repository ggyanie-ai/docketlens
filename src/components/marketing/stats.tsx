import { Card } from "@/components/ui/card";

const STATS = [
  { value: "94", suffix: "M+", label: "RECAP docket entries indexed", note: "via Free Law Project" },
  { value: "13", suffix: "k/day", label: "New federal filings ingested", note: "94 districts, 13 circuits" },
  { value: "$0.10", suffix: "/page", label: "What PACER charges", note: "we cache the public copy" },
  { value: "4.2", suffix: "s", label: "Median time-to-alert", note: "watchlist match → email" },
];

export function Stats() {
  return (
    <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {STATS.map((s) => (
            <Card
              key={s.label}
              className="rounded-none border-0 bg-[color:var(--color-bg)] p-6"
            >
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl md:text-5xl text-[color:var(--color-fg)] tabular leading-none">
                  {s.value}
                </span>
                <span className="text-base text-[color:var(--color-fg-muted)] font-mono">
                  {s.suffix}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-[color:var(--color-fg)]">
                {s.label}
              </p>
              <p className="mt-1 text-[12px] text-[color:var(--color-fg-subtle)]">
                {s.note}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
