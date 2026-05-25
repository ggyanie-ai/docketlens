import { Briefcase, Newspaper, TrendingUp, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const PERSONAS = [
  {
    icon: Briefcase,
    title: "Solo & small-firm litigators",
    color: "accent",
    body:
      "Track opposing counsel and competing firms — see what's being filed against your clients before opposing counsel calls.",
    quote:
      "Saved me at least one billable hour every morning. I used to scroll PACER manually.",
    who: "— Solo IP attorney, Austin",
  },
  {
    icon: Newspaper,
    title: "Reporters & investigators",
    color: "info",
    body:
      "Set up watches on companies, executives, or VCs. The newsroom gets the alert the moment a complaint hits the docket.",
    quote:
      "We broke three M&A stories last quarter from DocketLens alerts before the 8-K hit.",
    who: "— Senior reporter, financial newsroom",
  },
  {
    icon: TrendingUp,
    title: "Investors & analysts",
    color: "success",
    body:
      "Securities suits, patent litigation, M&A challenges — material litigation moves stocks. Watch your portfolio in real time.",
    quote:
      "It's a litigation Bloomberg I can actually afford.",
    who: "— Long/short equity PM",
  },
  {
    icon: ShieldCheck,
    title: "Corporate legal & compliance",
    color: "warning",
    body:
      "Monitor every case naming your company, subsidiaries, or vendors. Spot duplicate suits, MDL formation, and forum-shopping patterns early.",
    quote:
      "Our intake form went from a fire drill to a queue.",
    who: "— In-house litigation director",
  },
] as const;

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-4">Who uses it</p>
          <h2 className="display-2">
            For people who can&apos;t afford a $50k/yr{" "}
            <span className="italic">Bloomberg Law</span> seat.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PERSONAS.map((p) => (
            <Card key={p.title} className="p-8 flex flex-col gap-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-${p.color})]/15 text-[color:var(--color-${p.color})]`}>
                  <p.icon className="size-5" />
                </div>
                <h3 className="text-lg font-medium tracking-tight">{p.title}</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
                {p.body}
              </p>
              <figure className="border-l-2 border-[color:var(--color-accent)] pl-4 mt-auto">
                <blockquote className="font-serif text-lg leading-snug text-[color:var(--color-fg)]">
                  &quot;{p.quote}&quot;
                </blockquote>
                <figcaption className="mt-2 text-xs text-[color:var(--color-fg-subtle)] font-mono">
                  {p.who}
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
