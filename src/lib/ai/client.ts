import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "@/lib/env";
import {
  PROMPT_VERSION,
  SYSTEM_BASE,
  buildSummaryMessages,
  type SummaryRequest,
} from "./prompts";
import { createHash } from "node:crypto";

/* ============================================================================
 *  Thin Claude wrapper used by the summarization service.
 *
 *  - Prompt caching via the system block (large SYSTEM_BASE keeps stable across
 *    calls — perfect for the 5-minute cache TTL).
 *  - Returns content + token usage so we can cost-attribute per org.
 *  - Stubbed gracefully when ANTHROPIC_API_KEY is absent (returns placeholder).
 * ==========================================================================*/

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (_client) return _client;
  const key = serverEnv?.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export interface SummaryResult {
  content: string;
  model: string;
  promptVersion: string;
  tokensIn: number;
  tokensOut: number;
  sourceHash: string;
  cached: boolean;
}

const PLACEHOLDER: Record<SummaryRequest["tier"], string> = {
  one_liner:
    "[AI summary unavailable in this environment — wire ANTHROPIC_API_KEY to generate.]",
  paragraph:
    "[AI summary unavailable in this environment — wire ANTHROPIC_API_KEY to generate the paragraph-tier extractive summary.]",
  exec: "[AI exec summary unavailable in this environment — wire ANTHROPIC_API_KEY to generate the three-paragraph executive brief.]",
};

export async function summarize(req: SummaryRequest): Promise<SummaryResult> {
  const sourceHash = createHash("sha256")
    .update(`${req.entityType}|${req.entityId}|${req.tier}|${req.sourceText}`)
    .digest("hex");

  const client = getClient();
  const model =
    req.tier === "exec"
      ? serverEnv?.ANTHROPIC_MODEL_DEEP ?? "claude-sonnet-4-6"
      : serverEnv?.ANTHROPIC_MODEL_SUMMARY ?? "claude-haiku-4-5-20251001";

  if (!client) {
    return {
      content: PLACEHOLDER[req.tier],
      model,
      promptVersion: PROMPT_VERSION,
      tokensIn: 0,
      tokensOut: 0,
      sourceHash,
      cached: false,
    };
  }

  const messages = buildSummaryMessages(req);

  const response = await client.messages.create({
    model,
    max_tokens: req.tier === "exec" ? 1024 : 400,
    temperature: 0,
    system: [
      {
        type: "text",
        text: SYSTEM_BASE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const text = response.content
    .filter((c): c is Anthropic.Messages.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();

  return {
    content: text,
    model: response.model,
    promptVersion: PROMPT_VERSION,
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
    sourceHash,
    cached: false,
  };
}

export { PROMPT_VERSION };
