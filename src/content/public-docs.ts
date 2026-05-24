/* ============================================================================
 *  Public-docs allowlist
 *
 *  Only the docs listed here are exposed at /docs/<slug>. Internal docs
 *  (DEPLOY.md, RUNBOOK.md, STATE.md) stay in the repo but are explicitly
 *  not surfaced on the public web.
 * ==========================================================================*/

export interface PublicDoc {
  slug: string;
  /** Filename inside `docs/` (relative to repo root). */
  file: string;
  title: string;
  /** One-line shelf description for the /docs index. */
  summary: string;
  /** Read-time estimate in minutes — only the index uses this. */
  readMinutes: number;
  /** "API reference" → API, "Architecture" → Architecture, etc. */
  group: "Reference" | "Engineering" | "Operating";
}

export const PUBLIC_DOCS: PublicDoc[] = [
  {
    slug: "api",
    file: "API.md",
    title: "REST API reference",
    summary:
      "Every endpoint of the public DocketLens REST API v1, with auth, rate limits, response shapes, and webhook delivery payloads.",
    readMinutes: 6,
    group: "Reference",
  },
  {
    slug: "architecture",
    file: "ARCHITECTURE.md",
    title: "System architecture",
    summary:
      "Layers, data flow, the ingest worker, performance targets, and the trust + safety stance.",
    readMinutes: 9,
    group: "Engineering",
  },
  {
    slug: "accessibility",
    file: "A11Y.md",
    title: "Accessibility audit",
    summary:
      "Self-audit against WCAG 2.1 AA — landmarks, navigation, motion, what's in place, what's queued for 0.2.0.",
    readMinutes: 4,
    group: "Engineering",
  },
];

export function getPublicDoc(slug: string): PublicDoc | undefined {
  return PUBLIC_DOCS.find((d) => d.slug === slug);
}
