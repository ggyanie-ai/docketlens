import { Card } from "@/components/ui/card";
import { Search, Bookmark, Inbox } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Find what matters",
    body:
      "Type a company name, attorney, law firm, or judge. We resolve aliases — Apple Inc. matches Apple, Inc., APPLE INC., and Apple Computer Inc.",
  },
  {
    n: "02",
    icon: Bookmark,
    title: "Save it as a watch",
    body:
      "One click. Layer optional filters: only complaints, only patent cases, only S.D.N.Y., only when the demand exceeds $10M.",
  },
  {
    n: "03",
    icon: Inbox,
    title: "Wake up to a digest",
    body:
      "Every morning at 7am local. Three-line AI summary per filing, full text one click away, downloadable PDFs, share links for the team.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] -mx-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="display-2 text-[color:var(--color-fg)]">
              Three steps from{" "}
              <span className="italic">noise</span> to{" "}
              <span className="italic text-[color:var(--color-accent)]">signal</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <Card key={s.n} className="p-7 flex flex-col gap-5 relative overflow-hidden bg-[color:var(--color-bg)]">
                <span className="absolute top-5 right-6 font-serif text-5xl text-[color:var(--color-border-strong)] leading-none tabular">
                  {s.n}
                </span>
                <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-fg)] text-[color:var(--color-bg)]">
                  <s.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)] max-w-sm">
                    {s.body}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
