import {
  Bell,
  Brain,
  Eye,
  Filter,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  Webhook,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Eye,
    title: "Entity watchlists",
    body:
      "Track any party, attorney, judge, or law firm across the entire federal system. One click — we handle aliases, subsidiaries, and corporate-form drift.",
  },
  {
    icon: Brain,
    title: "AI-summarized filings",
    body:
      "Every complaint, motion, and order distilled to a one-liner, a paragraph, and an exec summary. Powered by Claude — citations linked back to the source PDF.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    body:
      "Real-time, hourly, or daily digests. Filter by filing type — only notice me when something *actually* happens. Stop drowning in scheduling orders.",
  },
  {
    icon: Filter,
    title: "Faceted search",
    body:
      "Slice by court, judge, NOS code, party type, date range, and case status. Save searches and turn any of them into an alert with one click.",
  },
  {
    icon: Layers,
    title: "Case timelines",
    body:
      "Visualize a case as a timeline, not a 600-row docket. Color-coded by filer, motion stage, and impact. Export to PDF or PNG for client memos.",
  },
  {
    icon: Webhook,
    title: "Webhooks + API",
    body:
      "Pipe filings into Slack, Notion, Linear, or your internal stack. REST API on the Team tier with documented schemas and rate limits.",
  },
  {
    icon: GitBranch,
    title: "Related-case graph",
    body:
      "When a complaint references a prior action, MDL, or appeal, we surface the link. See litigation patterns across courts and counsel.",
  },
  {
    icon: KeyRound,
    title: "BYO PACER token",
    body:
      "Pro+ users can bring their own CourtListener token for higher refresh rates on private watchlists. Your queries, your quota.",
  },
  {
    icon: Globe,
    title: "Built on public data",
    body:
      "RECAP and the Free Law Project archive PACER's public dockets. We cache and enrich — never paywalled, never hidden behind enterprise sales.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-4">What&apos;s inside</p>
          <h2 className="display-2 text-[color:var(--color-fg)]">
            Nine systems quietly working{" "}
            <span className="italic text-[color:var(--color-fg-muted)]">while you sleep.</span>
          </h2>
          <p className="mt-5 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
            DocketLens isn&apos;t a search box on top of PACER. It&apos;s a full data pipeline,
            entity-resolution layer, AI summarization stack, and alerting engine — built
            for the way modern litigation actually moves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {FEATURES.map((f) => (
            <Card key={f.title} className="rounded-none border-0 bg-[color:var(--color-bg)] p-7 flex flex-col gap-4 hover:bg-[color:var(--color-bg-subtle)] transition-colors">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-fg)] dark:text-[color:var(--color-accent)]">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-base font-medium tracking-tight">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
