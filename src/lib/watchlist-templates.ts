/* ============================================================================
 *  Watchlist starter templates
 *
 *  Six prebuilt watchlists offered on the /watchlists empty state. Each
 *  template is a deep-link to /watchlists/new with the entity type, name,
 *  match value, and (optional) court / NOS filters preselected via URL
 *  params. Reduces the blank-page friction of "I don't know what to watch."
 *
 *  Picked to span the entity types we support (party · judge · law firm ·
 *  term) and the practice areas the demo cases live in (securities,
 *  patent, antitrust). Aliases ("Apple Inc." → "Apple", "APPLE INC.")
 *  are handled by the watchlist matcher's normalizer; templates use the
 *  canonical form.
 * ==========================================================================*/

export type WatchlistEntityType =
  | "party"
  | "attorney"
  | "judge"
  | "lawfirm"
  | "case"
  | "term";

export interface WatchlistTemplate {
  id: string;
  /** Display name shown on the suggestion card. */
  name: string;
  /** One-line pitch. */
  blurb: string;
  /** Entity type — drives the form's Step 1 choice. */
  entityType: WatchlistEntityType;
  /** The match value (party name / judge name / search term). */
  matchValue: string;
  /** Optional court short-name filters (e.g. "S.D.N.Y."). */
  courts?: string[];
  /** Optional NOS code filters (e.g. "850"). */
  nosCodes?: string[];
  /** Estimated number of matching cases (for the card preview only). */
  approxMatches: string;
  /** lucide-react icon name (looked up at render time). */
  icon: "building2" | "gavel" | "briefcase" | "scale" | "shield" | "search";
}

export const WATCHLIST_TEMPLATES: WatchlistTemplate[] = [
  {
    id: "tpl_apple",
    name: "Apple Inc.",
    blurb:
      "Every federal case naming Apple or its subsidiaries. Aliases handled (Apple, Inc., APPLE INC., Apple Computer Inc.).",
    entityType: "party",
    matchValue: "Apple Inc.",
    approxMatches: "~140 active",
    icon: "building2",
  },
  {
    id: "tpl_alsup",
    name: "Hon. William H. Alsup",
    blurb:
      "Every docket assigned to Judge Alsup in the N.D. Cal. Useful for tech + antitrust signal.",
    entityType: "judge",
    matchValue: "William H. Alsup",
    courts: ["N.D. Cal."],
    approxMatches: "47 last 90d",
    icon: "gavel",
  },
  {
    id: "tpl_kirkland",
    name: "Kirkland & Ellis LLP",
    blurb:
      "Every case with K&E as counsel of record. Spot deal patterns and litigation trends.",
    entityType: "lawfirm",
    matchValue: "Kirkland & Ellis LLP",
    approxMatches: "~220/mo",
    icon: "briefcase",
  },
  {
    id: "tpl_sec_10b_sdny",
    name: "Securities §10(b) — S.D.N.Y.",
    blurb:
      "Putative class actions and §10(b)/Rule 10b-5 filings in the Southern District of New York.",
    entityType: "term",
    matchValue: "10(b)",
    courts: ["S.D.N.Y."],
    nosCodes: ["850"],
    approxMatches: "~89/mo",
    icon: "scale",
  },
  {
    id: "tpl_patent_edtex",
    name: "Patent suits — E.D. Tex.",
    blurb:
      "Every NOS 830 patent infringement complaint in the Eastern District of Texas.",
    entityType: "term",
    matchValue: "patent",
    courts: ["E.D. Tex."],
    nosCodes: ["830"],
    approxMatches: "~310/mo",
    icon: "shield",
  },
  {
    id: "tpl_antitrust_ddc",
    name: "Antitrust — D.D.C.",
    blurb:
      "FTC, DOJ Antitrust, and private NOS 410 filings in the District of Columbia.",
    entityType: "term",
    matchValue: "antitrust",
    courts: ["D.D.C."],
    nosCodes: ["410"],
    approxMatches: "~28/mo",
    icon: "search",
  },
];

/**
 * Build the deep-link to /watchlists/new with a template's fields encoded as
 * URL query params. The new-watchlist page reads these in useState
 * initialisers to seed the form.
 */
export function templateHref(t: WatchlistTemplate): string {
  const sp = new URLSearchParams();
  sp.set("template", t.id);
  sp.set("type", t.entityType);
  sp.set("name", t.name);
  sp.set("match", t.matchValue);
  if (t.courts?.length) sp.set("courts", t.courts.join(","));
  if (t.nosCodes?.length) sp.set("nos", t.nosCodes.join(","));
  return `/watchlists/new?${sp.toString()}`;
}
