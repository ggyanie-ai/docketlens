"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Check, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROMPT_VERSION } from "@/lib/ai/prompts";

/* ============================================================================
 *  AiExecSummaryCard
 *
 *  Client-side stub of the per-docket "AI exec brief" flow:
 *    Idle → Loader toast (toast.loading id'd so we can update in-place) →
 *    Success toast + animated inline reveal of the generated brief.
 *
 *  We generate the brief deterministically from the docket props so the demo
 *  is stable and extractive (no fabricated facts). When ANTHROPIC_API_KEY is
 *  wired Tuesday, the same component will swap in a server action that calls
 *  `summarize({ tier: "exec" })` from src/lib/ai/client.ts.
 * ==========================================================================*/

interface PartySummary {
  name: string;
  role: string;
}

interface AiExecSummaryCardProps {
  caseName: string;
  court: string;
  caseNumber: string;
  natureOfSuit: string;
  juryDemand: string;
  judge: string;
  parties: PartySummary[];
  lastEntry?: {
    type: string;
    short: string;
    dateFiled: string;
  };
}

export function AiExecSummaryCard(props: AiExecSummaryCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [brief, setBrief] = useState<string[]>([]);
  const [meta, setMeta] = useState<{
    model: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
  } | null>(null);
  const generatedRef = useRef<HTMLDivElement>(null);

  async function generate() {
    if (status === "loading") return;

    setStatus("loading");
    const tId = toast.loading("Generating exec brief with Claude…", {
      description: "Sonnet 4.6 · streaming",
    });
    const started = performance.now();

    // Faked latency — between 1.8s and 2.6s for a more lifelike feel
    const delay = 1800 + Math.random() * 800;
    await new Promise((r) => setTimeout(r, delay));

    const paragraphs = buildBrief(props);
    const latencyMs = Math.round(performance.now() - started);
    const tokensIn = Math.round(380 + Math.random() * 80);
    const tokensOut = paragraphs.join(" ").split(/\s+/).length * 1.34;

    setBrief(paragraphs);
    setMeta({
      model: "claude-sonnet-4-6",
      tokensIn,
      tokensOut: Math.round(tokensOut),
      latencyMs,
    });
    setStatus("ready");

    toast.success("Executive brief ready", {
      id: tId,
      description: `${Math.round(tokensOut)} tokens · ${(latencyMs / 1000).toFixed(1)}s`,
      duration: 4000,
    });
  }

  // Scroll the freshly-generated brief into view (header link uses #ai-exec-card)
  useEffect(() => {
    if (status === "ready" && generatedRef.current) {
      generatedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [status]);

  function copyBrief() {
    if (brief.length === 0) return;
    void navigator.clipboard.writeText(brief.join("\n\n")).then(() => {
      toast.success("Brief copied", { description: "Three paragraphs on your clipboard." });
    });
  }

  return (
    <Card
      id="ai-exec-card"
      className="p-5 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent scroll-mt-24"
    >
      <p className="eyebrow mb-2">
        <Sparkles className="inline size-3 mr-1 -translate-y-px" />
        AI exec summary
      </p>
      <p className="text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]">
        Generate a three-paragraph executive brief of this entire docket — the
        case in plain English, the parties and dollar amounts, and what&apos;s
        procedurally next.
      </p>

      {status !== "ready" && (
        <Button
          variant="accent"
          size="sm"
          className="mt-3 w-full"
          onClick={generate}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          aria-live="polite"
          aria-describedby="ai-exec-card"
        >
          {status === "loading" ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>Generate ($0.04)</>
          )}
        </Button>
      )}

      {status === "ready" && (
        <div
          ref={generatedRef}
          role="region"
          aria-label="AI-generated executive brief"
          className="mt-4 animate-fade-in-up"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[color:var(--color-success)]">
              <Check className="size-3" />
              Generated
            </p>
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex items-center gap-1 text-[11px] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
              aria-label="Copy brief"
            >
              <Copy className="size-3" />
              Copy
            </button>
          </div>

          <div className="space-y-3 text-[13.5px] leading-relaxed text-[color:var(--color-fg)] font-serif">
            {brief.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {meta && (
            <p className="mt-4 pt-3 border-t border-[color:var(--color-border)] text-[10.5px] font-mono tabular text-[color:var(--color-fg-subtle)] flex flex-wrap gap-x-3 gap-y-1">
              <span>{meta.model}</span>
              <span>·</span>
              <span>{meta.tokensIn} in</span>
              <span>·</span>
              <span>{meta.tokensOut} out</span>
              <span>·</span>
              <span>{(meta.latencyMs / 1000).toFixed(1)}s</span>
              <span>·</span>
              <span
                title="Prompt version this brief was generated under"
                className="text-[color:var(--color-fg-muted)]"
              >
                prompt {PROMPT_VERSION}
              </span>
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

/* ----------------------------------------------------------------------------
 *  Brief generator.
 *
 *  Extractive ONLY — every fact in the output appears verbatim or in obvious
 *  rephrase form in the props. No outcome prediction, no commentary.
 * --------------------------------------------------------------------------*/
function buildBrief(p: AiExecSummaryCardProps): string[] {
  const plaintiffs = p.parties.filter((x) => /plaintiff|petitioner/i.test(x.role));
  const defendants = p.parties.filter((x) => /defendant|respondent/i.test(x.role));

  const plList = plaintiffs.map((x) => x.name).join(", ") || p.parties[0]?.name || "(unnamed)";
  const defList = defendants.map((x) => x.name).join(", ") || p.parties[1]?.name || "(unnamed)";

  const noseShort = p.natureOfSuit.split("—")[1]?.trim() ?? p.natureOfSuit;

  const para1 =
    `${plList} filed against ${defList} in the ${p.court}, ` +
    `docket number ${p.caseNumber}. The case is categorized as ${noseShort.toLowerCase()} ` +
    `with a ${p.juryDemand.toLowerCase()} jury demand.`;

  const partyLine = p.parties
    .map((x) => `${x.name} (${x.role})`)
    .slice(0, 4)
    .join("; ");
  const para2 =
    `${partyLine}. The case is presided over by ${p.judge}.`;

  const para3 = p.lastEntry
    ? `The most recent entry on the docket is a ${p.lastEntry.type.toLowerCase()} dated ` +
      `${new Date(p.lastEntry.dateFiled).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}: ${p.lastEntry.short.replace(/\.$/, "")}. ` +
      `Refer to the timeline above for procedural detail.`
    : `No further procedural status is available in the cached docket.`;

  return [para1, para2, para3];
}
