import { z } from "zod";

/* ============================================================================
 * Minimal zod schemas for CourtListener REST v4 responses.
 * We intentionally keep these forgiving — CL evolves; we passthrough
 * unknown keys into `raw` on our side.
 * ==========================================================================*/

export const CLPaginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  });

export const CLCourt = z
  .object({
    id: z.string(),
    full_name: z.string(),
    short_name: z.string(),
    jurisdiction: z.string(),
    citation_string: z.string().nullable().optional(),
    in_use: z.boolean().optional().default(true),
  })
  .passthrough();
export type CLCourt = z.infer<typeof CLCourt>;

export const CLDocket = z
  .object({
    id: z.number(),
    resource_uri: z.string().optional(),
    court: z.string().nullable().optional(),
    court_id: z.string().nullable().optional(),
    case_name: z.string().nullable().optional(),
    case_name_short: z.string().nullable().optional(),
    case_name_full: z.string().nullable().optional(),
    docket_number: z.string().nullable().optional(),
    pacer_case_id: z.string().nullable().optional(),
    nature_of_suit: z.string().nullable().optional(),
    cause: z.string().nullable().optional(),
    jury_demand: z.string().nullable().optional(),
    date_filed: z.string().nullable().optional(),
    date_terminated: z.string().nullable().optional(),
    date_last_filing: z.string().nullable().optional(),
    assigned_to_str: z.string().nullable().optional(),
    referred_to_str: z.string().nullable().optional(),
    source: z.number().nullable().optional(),
  })
  .passthrough();
export type CLDocket = z.infer<typeof CLDocket>;

export const CLDocketEntry = z
  .object({
    id: z.number(),
    docket: z.string().or(z.number()).optional(),
    entry_number: z.number().nullable().optional(),
    date_filed: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    short_description: z.string().nullable().optional(),
    recap_documents: z.array(z.unknown()).optional(),
  })
  .passthrough();
export type CLDocketEntry = z.infer<typeof CLDocketEntry>;

export const CLParty = z
  .object({
    id: z.number(),
    name: z.string(),
    extra_info: z.string().nullable().optional(),
    date_terminated: z.string().nullable().optional(),
    party_types: z
      .array(
        z
          .object({
            name: z.string().nullable().optional(),
            docket: z.string().or(z.number()).optional(),
          })
          .passthrough()
      )
      .optional(),
    attorneys: z.array(z.unknown()).optional(),
  })
  .passthrough();
export type CLParty = z.infer<typeof CLParty>;

export const CLOpinionCluster = z
  .object({
    id: z.number(),
    case_name: z.string().nullable().optional(),
    docket: z.string().nullable().optional(),
    date_filed: z.string().nullable().optional(),
    citation_count: z.number().nullable().optional(),
    precedential_status: z.string().nullable().optional(),
  })
  .passthrough();
export type CLOpinionCluster = z.infer<typeof CLOpinionCluster>;

export const CLSearchResult = z
  .object({
    docket_id: z.number().nullable().optional(),
    docketNumber: z.string().nullable().optional(),
    caseName: z.string().nullable().optional(),
    caseNameShort: z.string().nullable().optional(),
    court: z.string().nullable().optional(),
    court_id: z.string().nullable().optional(),
    dateFiled: z.string().nullable().optional(),
    suitNature: z.string().nullable().optional(),
    score: z.unknown().optional(),
    /* Many other typed fields per type=r|o|p */
  })
  .passthrough();
export type CLSearchResult = z.infer<typeof CLSearchResult>;

export type SearchType = "r" | "o" | "rd" | "p" | "oa";

export interface SearchParams {
  q?: string;
  type?: SearchType; // r=RECAP, o=opinions, rd=RECAP documents, p=people, oa=oral arguments
  court?: string | string[];
  case_name?: string;
  judge?: string;
  party_name?: string;
  attorney?: string;
  nature_of_suit?: string;
  filed_after?: string; // YYYY-MM-DD
  filed_before?: string;
  order_by?: string;
  cursor?: string;
  page_size?: number;
}
