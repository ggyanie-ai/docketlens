import type {
  Docket,
  DocketEntry,
  Party,
  Watchlist,
} from "@/lib/db/schema";
import { normalizeEntityName } from "@/lib/db/ids";

/* ============================================================================
 *  Watchlist matcher.
 *
 *  Given a (docket + entry + parties) tuple and a watchlist, decide whether
 *  the new docket entry should produce a watchlist_match. We deliberately
 *  keep matching deterministic + explainable — no fuzzy ML in the hot path.
 *  AI is reserved for the summarization layer, downstream of matching.
 *
 *  Match precedence:
 *    1. exact normalized equality on the canonical field
 *    2. token-subset (every word in the watchlist value appears in the
 *       candidate, in order, after normalization). This subsumes a naive
 *       substring check — a single-token needle is `hay.indexOf(needle)`,
 *       and a multi-token needle whose literal appears in the candidate
 *       has its tokens in order by construction.
 *
 *  (An earlier revision shipped a tier-3 substring fallback. We removed
 *  it after the test pass on 2026-05-25 proved it was unreachable —
 *  see commit history + docs/TESTING.md.)
 * ==========================================================================*/

export interface MatchContext {
  docket: Pick<
    Docket,
    | "id"
    | "court"
    | "caseName"
    | "docketNumber"
    | "natureOfSuit"
    | "assignedTo"
    | "dateFiled"
  >;
  entry?: Pick<DocketEntry, "id" | "description" | "dateFiled"> | null;
  parties?: Pick<Party, "name" | "nameNormalized" | "role">[];
  attorneys?: { name: string; nameNormalized: string }[];
}

export interface MatchResult {
  matched: boolean;
  reason?: string;
  score: number; // 0..1 confidence
}

const NEGATIVE: MatchResult = { matched: false, score: 0 };

export function matchWatchlist(
  ctx: MatchContext,
  w: Pick<Watchlist, "entityType" | "matchValueNormalized" | "filters">
): MatchResult {
  // ---- filter gates ----
  const f = w.filters ?? {};
  if (f.courts && f.courts.length > 0 && !f.courts.includes(ctx.docket.court)) {
    return NEGATIVE;
  }
  if (
    f.natureOfSuitCodes &&
    f.natureOfSuitCodes.length > 0 &&
    !f.natureOfSuitCodes.some((code) =>
      ctx.docket.natureOfSuit?.startsWith(code)
    )
  ) {
    return NEGATIVE;
  }
  if (f.startDate && ctx.docket.dateFiled) {
    if (ctx.docket.dateFiled.getTime() < new Date(f.startDate).getTime()) {
      return NEGATIVE;
    }
  }
  if (f.endDate && ctx.docket.dateFiled) {
    if (ctx.docket.dateFiled.getTime() > new Date(f.endDate).getTime()) {
      return NEGATIVE;
    }
  }

  // ---- entity-type lookups ----
  switch (w.entityType) {
    case "party":
      return matchAgainstNames(
        ctx.parties?.map((p) => p.nameNormalized) ?? [],
        w.matchValueNormalized,
        "party"
      );
    case "attorney":
      return matchAgainstNames(
        ctx.attorneys?.map((a) => a.nameNormalized) ?? [],
        w.matchValueNormalized,
        "attorney"
      );
    case "judge":
      return matchAgainstNames(
        [ctx.docket.assignedTo].filter(Boolean).map((n) => normalizeEntityName(n!)),
        w.matchValueNormalized,
        "judge"
      );
    case "lawfirm":
      // Law-firm strings are tucked into attorney `contact_raw` upstream;
      // we treat any party.counsel string mentioning the firm as a hit.
      return matchAgainstNames(
        ctx.attorneys?.map((a) => a.nameNormalized) ?? [],
        w.matchValueNormalized,
        "law firm (via attorney record)"
      );
    case "case":
      // Match on case number OR case name
      if (
        ctx.docket.docketNumber &&
        ctx.docket.docketNumber.toLowerCase() ===
          w.matchValueNormalized.toLowerCase()
      ) {
        return { matched: true, score: 1, reason: "exact case number" };
      }
      return matchAgainstNames(
        [normalizeEntityName(ctx.docket.caseName)],
        w.matchValueNormalized,
        "case name"
      );
    case "term":
      // Free-text search across all available text fields in this context
      return matchTerm(ctx, w.matchValueNormalized);
  }

  return NEGATIVE;
}

function matchAgainstNames(
  candidates: string[],
  needle: string,
  label: string
): MatchResult {
  if (!needle || candidates.length === 0) return NEGATIVE;
  const n = needle.trim();
  for (const c of candidates) {
    if (!c) continue;
    if (c === n) return { matched: true, score: 1, reason: `exact ${label} match` };
  }
  for (const c of candidates) {
    if (!c) continue;
    if (tokenSubset(n, c)) {
      return { matched: true, score: 0.85, reason: `token-subset ${label} match` };
    }
  }
  return NEGATIVE;
}

function tokenSubset(needle: string, hay: string) {
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  let cursor = 0;
  for (const t of tokens) {
    const idx = hay.indexOf(t, cursor);
    if (idx === -1) return false;
    cursor = idx + t.length;
  }
  return true;
}

function matchTerm(ctx: MatchContext, term: string): MatchResult {
  const blob = [
    ctx.docket.caseName,
    ctx.docket.natureOfSuit,
    ctx.docket.assignedTo,
    ctx.entry?.description,
    ...(ctx.parties?.map((p) => p.name) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (blob.includes(term.toLowerCase())) {
    return { matched: true, score: 0.7, reason: "term in case text" };
  }
  return NEGATIVE;
}
