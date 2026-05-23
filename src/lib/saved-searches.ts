/* ============================================================================
 *  Saved searches — client-side persistence
 *
 *  Mirrors the shape of the future `saved_searches` row in the Drizzle schema,
 *  but lives in localStorage today because auth/db isn't wired live yet. When
 *  Better-Auth + Postgres land Tuesday, the same SavedSearch type can be
 *  marshalled into the DB without a code-shape change at the call site.
 * ==========================================================================*/

import { ids } from "@/lib/db/ids";

export const SS_STORAGE_KEY = "dl-saved-searches";

export interface SavedSearch {
  id: string;
  name: string;
  query: {
    q: string;
    court: string | null;
    nos: string | null;
    scope: string;
  };
  createdAt: number;
}

export function loadSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedSearch);
  } catch {
    return [];
  }
}

export function persistSavedSearches(list: SavedSearch[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage may be full/blocked — fail silently
  }
}

export function newSavedSearch(
  query: SavedSearch["query"],
  name?: string
): SavedSearch {
  return {
    id: ids.search(),
    name: name?.trim() || suggestName(query),
    query,
    createdAt: Date.now(),
  };
}

export function suggestName(q: SavedSearch["query"]): string {
  const parts: string[] = [];
  if (q.q) parts.push(`"${truncate(q.q, 30)}"`);
  if (q.court) parts.push(q.court);
  if (q.nos) parts.push(`NOS ${q.nos}`);
  if (q.scope && q.scope !== "all")
    parts.push(q.scope.charAt(0).toUpperCase() + q.scope.slice(1));
  if (parts.length === 0) return "All cases";
  return parts.join(" · ");
}

export function summarizeQuery(q: SavedSearch["query"]): string {
  const parts: string[] = [];
  if (q.q) parts.push(`text: ${q.q}`);
  if (q.court) parts.push(`court: ${q.court}`);
  if (q.nos) parts.push(`NOS ${q.nos}`);
  if (q.scope && q.scope !== "all") parts.push(q.scope);
  return parts.join(" · ") || "no filters";
}

function isSavedSearch(x: unknown): x is SavedSearch {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.createdAt === "number" &&
    !!r.query &&
    typeof r.query === "object"
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
