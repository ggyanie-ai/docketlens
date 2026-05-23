"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is this legal? Where does the data come from?",
    a: "Yes. Federal court dockets are public records. We source them from CourtListener and the RECAP archive maintained by the Free Law Project — the same public data PACER charges $0.10/page for. We cache and enrich the public copy; we never circumvent PACER's terms.",
  },
  {
    q: "Do you have state-court data?",
    a: "Not yet. We launched with federal (district, circuit, bankruptcy, and Supreme Court) because the data is uniform and high-quality. State courts vary wildly — we'll add the top 10 states by case volume in Q4, starting with NY, CA, TX, FL, and DE.",
  },
  {
    q: "How fast are alerts?",
    a: "Pro and Team users get median ~4s from RECAP ingestion to inbox. Free tier batches into a daily digest. We don't poll PACER directly — we ride on RECAP's upload firehose, which is how most real-time tools work.",
  },
  {
    q: "What about sealed cases and protective orders?",
    a: "We respect every seal. Sealed dockets are not in RECAP and therefore not in DocketLens. If a case is later unsealed, it appears in the next ingestion pass.",
  },
  {
    q: "Can I export?",
    a: "Yes. PDF case reports, CSV docket entry exports, and a JSON API on the Team tier. Your data is your data.",
  },
  {
    q: "Is the AI accurate? Can I trust it?",
    a: "We use Claude with strict instructions to extract only what's in the filing — no inference. Every AI line links to the source paragraph in the PDF. Treat the summaries as a fast first pass — and read the filing for anything you'd bet a case on.",
  },
  {
    q: "How is this different from Lex Machina, Docket Navigator, or Bloomberg Law?",
    a: "Those are enterprise products at enterprise prices ($25k–$100k+/yr). DocketLens is for the 95% of legal/research professionals who can't justify that spend. We trade some of their analytics depth for an actually-affordable price and a UX that doesn't feel like 2008.",
  },
  {
    q: "What about my CourtListener rate limit?",
    a: "By default we use a pooled token so you don't have to think about it. Pro+ users can BYO CourtListener token, which raises your refresh rate on the watchlists you care about most.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="mb-12">
          <p className="eyebrow mb-4">FAQ</p>
          <h2 className="display-2">
            Questions, <span className="italic">answered.</span>
          </h2>
        </div>
        <div className="flex flex-col">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="border-b border-[color:var(--color-border)] last:border-b-0"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 py-6 text-left ring-focus rounded"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium tracking-tight">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[color:var(--color-fg-muted)] transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
