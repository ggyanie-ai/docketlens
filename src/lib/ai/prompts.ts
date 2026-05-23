/* ============================================================================
 * Claude prompt library for DocketLens.
 *
 *  Strict extraction-only stance. Every summary must be derivable from the
 *  source text. No legal advice. No predictions.
 *
 *  Prompts are versioned — cached summaries that reference an older
 *  prompt_version are auto-regenerated on access.
 * ==========================================================================*/

export const PROMPT_VERSION = "2026-05-23.v1";

export const SYSTEM_BASE = `You are DocketLens, an extractive summarizer of U.S. federal court filings.

Hard rules:
- Only state facts that appear in the provided source. Never infer outcomes, motives, or legal conclusions.
- Use plain English. Avoid legalese where a normal noun works.
- Do NOT add disclaimers, opinions, or recommendations.
- Never use phrases like "the court should", "this is significant", or "in my view".
- If the source is too thin to summarize, say so in one sentence and stop.
- All dollar amounts and dates must come verbatim from the source.
- Format: prose only, no markdown headers, no bullet lists unless the user asks for them.
- Output English only.
`;

export interface SummaryRequest {
  /** Where this content lives in our system (for citation). */
  entityType: "docket" | "entry" | "complaint";
  entityId: string;
  /** Public case identifier for context. */
  caseName?: string;
  caseNumber?: string;
  court?: string;
  /** The filing text (already extracted from PDF if applicable). */
  sourceText: string;
  tier: "one_liner" | "paragraph" | "exec";
}

export function buildSummaryMessages(req: SummaryRequest) {
  const context = [
    req.caseName ? `Case name: ${req.caseName}` : null,
    req.caseNumber ? `Case number: ${req.caseNumber}` : null,
    req.court ? `Court: ${req.court}` : null,
    req.entityType ? `Filing type context: ${req.entityType}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const tierInstructions = TIER_INSTRUCTIONS[req.tier];

  const userText = `${context ? context + "\n\n" : ""}---
SOURCE TEXT:
"""
${truncate(req.sourceText, 32_000)}
"""

${tierInstructions}`;

  return [{ role: "user" as const, content: userText }];
}

const TIER_INSTRUCTIONS: Record<SummaryRequest["tier"], string> = {
  one_liner: `Write ONE sentence (max 32 words) capturing the most important factual claim or action in this filing. No qualifiers, no fluff.`,
  paragraph: `Write a single paragraph (3–5 sentences, max ~110 words) explaining:
1. Who filed what (one sentence)
2. The core relief sought or fact alleged (one or two sentences)
3. The named parties, dollar amounts, and dates (only if present in the source)
End the paragraph there. No transition sentence, no commentary.`,
  exec: `Write an executive summary in three short paragraphs (~250 words total):
Paragraph 1 — The filing in plain English (what happened).
Paragraph 2 — Key parties, dates, dollar amounts, and the exact relief requested (use verbatim numbers).
Paragraph 3 — Procedural status: what comes next on the docket if the source states it; otherwise omit this paragraph.`,
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…[TRUNCATED]" : s;
}

/* ============================================================================
 *  Entity-resolution prompt — used to normalize party / counsel names against
 *  our cached graph (Apple, Inc. ↔ Apple Computer ↔ APPLE INC.)
 * ==========================================================================*/
export const ENTITY_RESOLUTION_SYSTEM = `You normalize U.S. company and individual names for matching across federal court filings.

Output rules:
- Strip corporate suffixes (Inc., LLC, LP, Corp, Co., Ltd., etc.).
- Title-case the canonical name.
- For individuals, return "Last, First Middle" form.
- Mark ambiguous cases with confidence < 0.7.
- Output strict JSON only — no prose.
`;

export interface EntityResolutionRequest {
  candidates: string[];
}
