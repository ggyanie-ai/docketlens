/* ============================================================================
 *  Shared dataset filter for saved-search re-runs.
 *
 *  Mirrors the in-page filter used at /search so the dashboard, the RSS
 *  feed, and (eventually) the API client all see the same results for
 *  the same query.
 * ==========================================================================*/

import { SAMPLE_DOCKETS, type SampleDocket } from "@/lib/sample-data";

export interface SearchQuery {
  q?: string | null;
  court?: string | null;
  nos?: string | null;
  scope?: string | null;
}

const SCOPE_TAGS: Record<string, string> = {
  patent: "Patent",
  securities: "Securities",
  antitrust: "Antitrust",
};

export function runSearch(query: SearchQuery): SampleDocket[] {
  const q = query.q?.toLowerCase().trim() ?? "";
  return SAMPLE_DOCKETS.filter((d) => {
    if (q) {
      const haystack = `${d.caseName} ${d.caseNumber} ${d.parties
        .map((p) => p.name)
        .join(" ")} ${d.judge}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (query.court && d.court !== query.court) return false;
    if (query.nos && d.natureOfSuitCode !== query.nos) return false;
    if (query.scope && query.scope !== "all") {
      const tag = SCOPE_TAGS[query.scope];
      if (tag && !d.tags.includes(tag)) return false;
    }
    return true;
  }).sort((a, b) => b.filed.localeCompare(a.filed));
}

/** Render a human-readable summary of the filters for feed metadata. */
export function describeQuery(query: SearchQuery): string {
  const parts: string[] = [];
  if (query.q) parts.push(`text: "${query.q}"`);
  if (query.court) parts.push(`court: ${query.court}`);
  if (query.nos) parts.push(`NOS ${query.nos}`);
  if (query.scope && query.scope !== "all") parts.push(`scope: ${query.scope}`);
  return parts.length === 0 ? "all cases" : parts.join(" · ");
}
