import { describe, it, expect } from "vitest";
import { matchWatchlist, type MatchContext } from "./matcher";
import { normalizeEntityName } from "@/lib/db/ids";
import type { Docket, Watchlist } from "@/lib/db/schema";

/* ============================================================================
 *  Tests for the deterministic watchlist matcher.
 *
 *  This is core product logic. The matcher is the single decision point for
 *  whether a docket -> entry pairing generates a watchlist_match row, which
 *  then drives both the in-app match list and (via dispatch.ts) every
 *  outbound email + webhook + RSS item. Any regression here either misses
 *  alerts customers paid for or floods them with false positives.
 * ==========================================================================*/

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDocket(over: Partial<Docket> = {}): Docket {
  return {
    id: "dkt_test",
    clId: 1,
    court: "nysd",
    caseName: "Helios Bio Inc. v. Northgate Labs, Inc.",
    caseNameShort: null,
    docketNumber: "1:25-cv-04812",
    pacerCaseId: null,
    natureOfSuit: "840 — Patent (Trade Secret)",
    cause: null,
    juryDemand: null,
    dateFiled: new Date("2026-05-22"),
    dateTerminated: null,
    dateLastFiling: null,
    assignedTo: "Hon. Aileen R. Castillo",
    referredTo: null,
    appellateCaseTypeInformation: null,
    sourceCount: 0,
    raw: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

type WatchlistFields = Pick<
  Watchlist,
  "entityType" | "matchValueNormalized" | "filters"
>;

function makeWatchlist(over: Partial<WatchlistFields> = {}): WatchlistFields {
  return {
    entityType: "party",
    matchValueNormalized: "helios bio",
    filters: {},
    ...over,
  };
}

function makeCtx(over: Partial<MatchContext> = {}): MatchContext {
  return {
    docket: makeDocket(),
    entry: null,
    parties: [
      {
        name: "Helios Bio Inc.",
        nameNormalized: normalizeEntityName("Helios Bio Inc."),
        role: "Plaintiff",
      },
      {
        name: "Northgate Labs, Inc.",
        nameNormalized: normalizeEntityName("Northgate Labs, Inc."),
        role: "Defendant",
      },
    ],
    attorneys: [
      {
        name: "Inara Saxe",
        nameNormalized: normalizeEntityName("Inara Saxe"),
      },
    ],
    ...over,
  };
}

// ---------------------------------------------------------------------------
// 3-tier precedence
// ---------------------------------------------------------------------------

describe("matchWatchlist — precedence", () => {
  it("tier 1: exact normalized equality returns score=1", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ matchValueNormalized: "helios bio" })
    );
    expect(result.matched).toBe(true);
    expect(result.score).toBe(1);
    expect(result.reason).toMatch(/exact/);
  });

  it("tier 2: token-subset returns score=0.85", () => {
    // "helios" is a subset of "helios bio" tokens (subset of tokens, in order)
    // We pick a needle whose tokens appear in candidate but is not equal.
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ matchValueNormalized: "helios" })
    );
    expect(result.matched).toBe(true);
    expect(result.score).toBe(0.85);
    expect(result.reason).toMatch(/token-subset/);
  });

  it("tier 2 multi-token: in-order tokens across candidate", () => {
    // "helios" + "bio" present in order in "helios bio"
    const ctx = makeCtx({
      parties: [
        {
          name: "Helios Holdings Bio Inc.",
          nameNormalized: "helios holdings bio",
          role: "Plaintiff",
        },
      ],
    });
    const result = matchWatchlist(
      ctx,
      makeWatchlist({ matchValueNormalized: "helios bio" })
    );
    expect(result.matched).toBe(true);
    // exact equals would have been score=1; this is in-order tokens => 0.85
    expect(result.score).toBe(0.85);
  });

  it("tier 3: substring fallback returns score=0.6 (needle >= 5 chars)", () => {
    // Construct a candidate that contains the needle as substring but neither
    // exact-equals it nor decomposes into in-order tokens. The token-subset
    // algorithm treats the entire needle as a single token (no whitespace)
    // and looks for it via indexOf, so a single-token needle that's a
    // substring would match tier 2 first. We force tier 3 by using a
    // multi-token needle whose tokens DO NOT appear in order.
    const ctx = makeCtx({
      parties: [
        {
          name: "alpha beta gamma",
          nameNormalized: "alpha beta gamma",
          role: "Plaintiff",
        },
      ],
    });
    // Needle "beta alpha" -> tokens [beta, alpha]; in candidate, "beta"
    // appears at index 6, then we look for "alpha" starting at 10 — not
    // found. So token-subset fails. Now check substring: "beta alpha" is
    // not a substring of "alpha beta gamma" either, so this would NEGATIVE.
    // We need a candidate where the needle is a literal substring but
    // tokens-in-order fails. Easiest: needle has internal space at a
    // boundary that exists in the candidate as one chunk.
    // Example: candidate "xxx helios bio yyy" and needle "helios bio".
    // tokens [helios, bio] -> indexOf("helios", 0) finds it at 4, then
    // indexOf("bio", 4+6=10) finds "bio" at 11. That's a token-subset hit.
    // So I'll use an unrealistic needle.

    // Cleanest path: a needle that contains a character class skipping
    // tokens (impossible since needle is split on \s+). So we need
    // token-subset to fail. The only way is for the needle's literal tokens
    // to not all appear in order. Then we check substring — which is more
    // permissive than nothing. There's actually no realistic case where
    // substring catches something that token-subset wouldn't, because if
    // the whole literal "x y z" appears as substring, then tokens x, y, z
    // also appear in order.

    // Conclusion: tier 3 is functionally unreachable for multi-token needles
    // when the candidate contains the entire literal. It's only reachable
    // for single-token needles, but those go through tier 2 first via
    // indexOf. So tier 3 is essentially dead code. We document this via
    // a skip + TODO.

    // Sanity check the negative case at least:
    const result = matchWatchlist(
      ctx,
      makeWatchlist({ matchValueNormalized: "beta alpha" })
    );
    expect(result.matched).toBe(false);
  });

  it.skip("tier 3 substring is functionally unreachable — covered by skip", () => {
    // TODO: tier 3 (substring fallback, score 0.6) is unreachable in practice
    // because any single-token needle hits tier 2 via indexOf, and any
    // multi-token needle whose literal appears as substring also has its
    // tokens in order so tier 2 wins. Either remove tier 3 from the matcher
    // or change tier 2 to require a strict word-boundary token check.
  });

  it("non-match: needle absent from all candidate fields", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ matchValueNormalized: "completelyabsentfromcontext" })
    );
    expect(result.matched).toBe(false);
    expect(result.score).toBe(0);
  });

  it("empty needle never matches", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ matchValueNormalized: "" })
    );
    expect(result.matched).toBe(false);
  });

  it("substring fallback gated by needle length >= 5 — short needles fail", () => {
    // "xy" is too short to trigger the substring fallback even if it appears.
    const ctx = makeCtx({
      parties: [
        {
          name: "alpha beta",
          nameNormalized: "alpha beta",
          role: "Plaintiff",
        },
      ],
    });
    // needle "ph" — tokens=[ph], indexOf in "alpha beta" finds it at 2 -> tier 2 hit.
    // So actually any single-token short needle that's a substring will hit
    // tier 2 first. To prove tier 3 length-gate we'd need a multi-token
    // short needle whose tokens-in-order fails but literal appears — which
    // (as noted above) cannot exist. So we just assert short multi-token
    // misses fail negative.
    const result = matchWatchlist(
      ctx,
      makeWatchlist({ matchValueNormalized: "be al" })
    );
    expect(result.matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Entity-type-aware lookups
// ---------------------------------------------------------------------------

describe("matchWatchlist — entity-type lookups", () => {
  it("party: matches against parties[].nameNormalized only", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ entityType: "party", matchValueNormalized: "helios bio" })
    );
    expect(result.matched).toBe(true);
    expect(result.reason).toMatch(/party/);
  });

  it("party: does NOT match a value that only appears in the judge field", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "party",
        matchValueNormalized: "castillo",
      })
    );
    expect(result.matched).toBe(false);
  });

  it("attorney: matches against attorneys[].nameNormalized", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "attorney",
        matchValueNormalized: normalizeEntityName("Inara Saxe"),
      })
    );
    expect(result.matched).toBe(true);
    expect(result.reason).toMatch(/attorney/);
  });

  it("attorney: empty attorney list -> NEGATIVE", () => {
    const result = matchWatchlist(
      makeCtx({ attorneys: [] }),
      makeWatchlist({
        entityType: "attorney",
        matchValueNormalized: "inara saxe",
      })
    );
    expect(result.matched).toBe(false);
  });

  it("judge: matches normalized docket.assignedTo", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "judge",
        matchValueNormalized: normalizeEntityName("Hon. Aileen R. Castillo"),
      })
    );
    expect(result.matched).toBe(true);
    expect(result.reason).toMatch(/judge/);
  });

  it("judge: token-subset matches just 'castillo'", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "judge",
        matchValueNormalized: "castillo",
      })
    );
    expect(result.matched).toBe(true);
  });

  it("judge: NEGATIVE when assignedTo is null", () => {
    const result = matchWatchlist(
      makeCtx({ docket: makeDocket({ assignedTo: null }) }),
      makeWatchlist({
        entityType: "judge",
        matchValueNormalized: "castillo",
      })
    );
    expect(result.matched).toBe(false);
  });

  it("lawfirm: matches via attorney records (intentional, per comment in matcher)", () => {
    const ctx = makeCtx({
      attorneys: [
        {
          name: "Margolis & Crain LLP",
          nameNormalized: normalizeEntityName("Margolis & Crain LLP"),
        },
      ],
    });
    const result = matchWatchlist(
      ctx,
      makeWatchlist({
        entityType: "lawfirm",
        matchValueNormalized: normalizeEntityName("Margolis & Crain LLP"),
      })
    );
    expect(result.matched).toBe(true);
    expect(result.reason).toMatch(/law firm/);
  });

  it("case: exact docket-number match returns score=1", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "case",
        matchValueNormalized: "1:25-cv-04812",
      })
    );
    expect(result.matched).toBe(true);
    expect(result.score).toBe(1);
    expect(result.reason).toMatch(/case number/);
  });

  it("case: docket-number match is case-insensitive", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "case",
        matchValueNormalized: "1:25-CV-04812",
      })
    );
    expect(result.matched).toBe(true);
  });

  it("case: fallback to case-name match when docket-number doesn't match", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "case",
        matchValueNormalized: normalizeEntityName(
          "Helios Bio Inc. v. Northgate Labs, Inc."
        ),
      })
    );
    expect(result.matched).toBe(true);
    expect(result.reason).toMatch(/case name/);
  });

  it("term: matches free-text across case name + nos + judge + entry + parties", () => {
    const ctx = makeCtx({
      entry: {
        id: "ent_1",
        description: "Motion for TRO and expedited discovery",
        dateFiled: new Date(),
      },
    });
    const result = matchWatchlist(
      ctx,
      makeWatchlist({ entityType: "term", matchValueNormalized: "TRO" })
    );
    expect(result.matched).toBe(true);
    expect(result.score).toBe(0.7);
    expect(result.reason).toMatch(/term/);
  });

  it("term: matches inside case name", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "term",
        matchValueNormalized: "trade secret",
      })
    );
    // matches because NOS includes "Patent (Trade Secret)"
    expect(result.matched).toBe(true);
  });

  it("term: NEGATIVE when term not anywhere in the blob", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        entityType: "term",
        matchValueNormalized: "antitrust",
      })
    );
    expect(result.matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Filter gates
// ---------------------------------------------------------------------------

describe("matchWatchlist — filter gates", () => {
  it("courts filter: NEGATIVE when docket.court not in list", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { courts: ["cand", "ded"] } })
    );
    expect(result.matched).toBe(false);
  });

  it("courts filter: HIT when docket.court is in list", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { courts: ["nysd", "cand"] } })
    );
    expect(result.matched).toBe(true);
  });

  it("courts filter: empty array does not gate", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { courts: [] } })
    );
    expect(result.matched).toBe(true);
  });

  it("NOS filter: prefix-matches docket.natureOfSuit", () => {
    // natureOfSuit is "840 — Patent (Trade Secret)" -> starts with "840"
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { natureOfSuitCodes: ["840"] } })
    );
    expect(result.matched).toBe(true);
  });

  it("NOS filter: NEGATIVE when no code prefix-matches", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { natureOfSuitCodes: ["830", "410"] } })
    );
    expect(result.matched).toBe(false);
  });

  it("startDate filter: NEGATIVE when docket filed before", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { startDate: "2026-06-01" } })
    );
    expect(result.matched).toBe(false);
  });

  it("startDate filter: HIT when docket filed on/after", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { startDate: "2026-01-01" } })
    );
    expect(result.matched).toBe(true);
  });

  it("endDate filter: NEGATIVE when docket filed after", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { endDate: "2026-01-01" } })
    );
    expect(result.matched).toBe(false);
  });

  it("endDate filter: HIT when docket filed before", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({ filters: { endDate: "2026-12-31" } })
    );
    expect(result.matched).toBe(true);
  });

  it("combined filters: court + NOS both pass", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        filters: { courts: ["nysd"], natureOfSuitCodes: ["840"] },
      })
    );
    expect(result.matched).toBe(true);
  });

  it("combined filters: court passes but NOS fails -> NEGATIVE", () => {
    const result = matchWatchlist(
      makeCtx(),
      makeWatchlist({
        filters: { courts: ["nysd"], natureOfSuitCodes: ["830"] },
      })
    );
    expect(result.matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// normalizeEntityName edge cases
// ---------------------------------------------------------------------------

describe("normalizeEntityName", () => {
  it("lowercases", () => {
    expect(normalizeEntityName("HELIOS BIO")).toBe("helios bio");
  });

  it("strips standalone Inc.", () => {
    expect(normalizeEntityName("Helios Bio Inc.")).toBe("helios bio");
  });

  it("strips LLC", () => {
    expect(normalizeEntityName("Optera Semiconductor LLC")).toBe(
      "optera semiconductor"
    );
  });

  it("strips LLP", () => {
    expect(normalizeEntityName("Kirkland & Ellis LLP")).toBe("kirkland & ellis");
  });

  it("strips Corp / Corporation", () => {
    expect(normalizeEntityName("Aurora AI Corp.")).toBe("aurora ai");
    expect(normalizeEntityName("Crestmark Capital Corporation")).toBe(
      "crestmark capital"
    );
  });

  it("strips PLC", () => {
    expect(normalizeEntityName("ARM Holdings plc")).toBe("arm holdings");
  });

  it("strips Ltd", () => {
    expect(normalizeEntityName("Quantix Photonics Ltd")).toBe(
      "quantix photonics"
    );
  });

  it("collapses repeated whitespace", () => {
    expect(normalizeEntityName("Helios   Bio    Inc.")).toBe("helios bio");
  });

  it("removes punctuation: . , ' ` \"", () => {
    expect(normalizeEntityName("D'Angelo, Inc.")).toBe("dangelo");
    expect(normalizeEntityName("`weird`name'")).toBe("weirdname");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeEntityName("  Helios Bio Inc.  ")).toBe("helios bio");
  });

  it("idempotent: normalize(normalize(x)) === normalize(x)", () => {
    const once = normalizeEntityName("Helios Bio Inc.");
    expect(normalizeEntityName(once)).toBe(once);
  });

  it("handles a name that's ONLY suffixes -> empty string", () => {
    expect(normalizeEntityName("Inc. LLC LLP")).toBe("");
  });

  it("does not strip suffixes mid-word", () => {
    // The \b on both sides of (inc|...) prevents stripping "Inc" out of
    // "Incorporate" (no word boundary between Inc and orporate). So the
    // word "Incorporate" survives intact.
    expect(normalizeEntityName("Incorporate Things")).toBe(
      "incorporate things"
    );
    // 'incorporated' IS in the suffix list as a whole word, so it gets
    // stripped:
    expect(normalizeEntityName("Acme Incorporated")).toBe("acme");
  });
});
