import { describe, it, expect } from "vitest";
import { runSearch, describeQuery } from "./filter";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

/* ============================================================================
 *  Tests for the shared dataset filter used by /search + saved-search RSS.
 *
 *  Locking down the public contract so a future refactor (e.g. swapping in
 *  a real DB query) keeps the same shape and ordering.
 * ==========================================================================*/

describe("runSearch", () => {
  describe("empty query", () => {
    it("returns all 6 sample dockets when query is empty object", () => {
      const result = runSearch({});
      expect(result).toHaveLength(6);
      expect(result).toHaveLength(SAMPLE_DOCKETS.length);
    });

    it("returns all 6 dockets when q is empty string", () => {
      expect(runSearch({ q: "" })).toHaveLength(6);
    });

    it("returns all 6 dockets when q is only whitespace", () => {
      expect(runSearch({ q: "   " })).toHaveLength(6);
    });

    it("returns all 6 dockets when q is null", () => {
      expect(runSearch({ q: null })).toHaveLength(6);
    });

    it("returns all 6 dockets when scope is 'all'", () => {
      expect(runSearch({ scope: "all" })).toHaveLength(6);
    });
  });

  describe("court filter", () => {
    it("narrows to S.D.N.Y. cases only (2 cases)", () => {
      const result = runSearch({ court: "S.D.N.Y." });
      expect(result).toHaveLength(2);
      expect(result.every((d) => d.court === "S.D.N.Y.")).toBe(true);
    });

    it("narrows to N.D. Cal. (1 case — FTC v. Aurora AI)", () => {
      const result = runSearch({ court: "N.D. Cal." });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("dkt_ftc_v_aurora");
    });

    it("returns empty array for an unknown court", () => {
      expect(runSearch({ court: "Z.Z.Z." })).toEqual([]);
    });

    it("returns all 6 when court is null", () => {
      expect(runSearch({ court: null })).toHaveLength(6);
    });
  });

  describe("NOS (nature-of-suit) filter", () => {
    it("narrows to NOS 830 — Patent (Optera, Quantix MDL)", () => {
      const result = runSearch({ nos: "830" });
      expect(result).toHaveLength(2);
      expect(result.every((d) => d.natureOfSuitCode === "830")).toBe(true);
    });

    it("narrows to NOS 850 — Securities (Larsen, SEC v. Meridian)", () => {
      const result = runSearch({ nos: "850" });
      expect(result).toHaveLength(2);
      expect(result.every((d) => d.natureOfSuitCode === "850")).toBe(true);
    });

    it("narrows to NOS 410 — Antitrust (FTC v. Aurora AI)", () => {
      const result = runSearch({ nos: "410" });
      expect(result).toHaveLength(1);
      expect(result[0].natureOfSuitCode).toBe("410");
    });

    it("returns empty array for NOS code that's not in the sample", () => {
      expect(runSearch({ nos: "999" })).toEqual([]);
    });
  });

  describe("scope filter", () => {
    it("scope=patent picks dockets with 'Patent' tag", () => {
      const result = runSearch({ scope: "patent" });
      // Optera (Patent) + Quantix MDL (Patent). Helios has "Patent-adjacent"
      // (not exact "Patent") so it should NOT match.
      expect(result.every((d) => d.tags.includes("Patent"))).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      const ids = result.map((d) => d.id);
      expect(ids).toContain("dkt_optera_v_arm");
      expect(ids).toContain("dkt_mdl_quantix");
      expect(ids).not.toContain("dkt_helios_v_northgate");
    });

    it("scope=securities picks dockets with 'Securities' tag", () => {
      const result = runSearch({ scope: "securities" });
      expect(result.every((d) => d.tags.includes("Securities"))).toBe(true);
      const ids = result.map((d) => d.id);
      expect(ids).toContain("dkt_larsen_v_crestmark");
      expect(ids).toContain("dkt_sec_v_meridian");
    });

    it("scope=antitrust picks dockets with 'Antitrust' tag", () => {
      const result = runSearch({ scope: "antitrust" });
      expect(result.every((d) => d.tags.includes("Antitrust"))).toBe(true);
      expect(result.map((d) => d.id)).toContain("dkt_ftc_v_aurora");
    });

    it("scope=all is a no-op", () => {
      expect(runSearch({ scope: "all" })).toHaveLength(6);
    });

    it("unknown scope is a no-op (no SCOPE_TAGS entry)", () => {
      // SCOPE_TAGS has no key 'bogus', so the scope filter falls through.
      expect(runSearch({ scope: "bogus" })).toHaveLength(6);
    });
  });

  describe("free-text q matching", () => {
    it("matches on case name (Helios)", () => {
      const result = runSearch({ q: "helios" });
      expect(result.map((d) => d.id)).toContain("dkt_helios_v_northgate");
    });

    it("is case-insensitive (HELIOS)", () => {
      const result = runSearch({ q: "HELIOS" });
      expect(result.map((d) => d.id)).toContain("dkt_helios_v_northgate");
    });

    it("matches on party name (Aurora AI Corp.)", () => {
      const result = runSearch({ q: "Aurora AI" });
      expect(result.map((d) => d.id)).toContain("dkt_ftc_v_aurora");
    });

    it("matches on judge name (Stark)", () => {
      const result = runSearch({ q: "stark" });
      expect(result.map((d) => d.id)).toContain("dkt_optera_v_arm");
    });

    it("matches on docket number (04812)", () => {
      const result = runSearch({ q: "04812" });
      expect(result.map((d) => d.id)).toContain("dkt_helios_v_northgate");
    });

    it("trims surrounding whitespace from q", () => {
      const result = runSearch({ q: "  helios  " });
      expect(result.map((d) => d.id)).toContain("dkt_helios_v_northgate");
    });

    it("returns empty array for a query that matches nothing", () => {
      expect(runSearch({ q: "absolutelynonexistentstring" })).toEqual([]);
    });
  });

  describe("combined filters", () => {
    it("AND-combines court + q (Helios in S.D.N.Y.)", () => {
      const result = runSearch({ court: "S.D.N.Y.", q: "helios" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("dkt_helios_v_northgate");
    });

    it("AND-combines court + nos (S.D.N.Y. + 850 -> just Larsen)", () => {
      const result = runSearch({ court: "S.D.N.Y.", nos: "850" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("dkt_larsen_v_crestmark");
    });

    it("court + scope=patent narrows correctly (D. Del. + patent -> Optera)", () => {
      const result = runSearch({ court: "D. Del.", scope: "patent" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("dkt_optera_v_arm");
    });

    it("returns empty for an impossible combination", () => {
      expect(runSearch({ court: "S.D.N.Y.", scope: "antitrust" })).toEqual([]);
    });
  });

  describe("sort order", () => {
    it("sorts newest-first by `filed`", () => {
      const result = runSearch({});
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].filed >= result[i + 1].filed).toBe(true);
      }
    });

    it("places the most recently filed docket first", () => {
      const result = runSearch({});
      // 2026-05-23 dockets: Larsen and Quantix MDL entry 9. The docket-level
      // `filed` for Larsen is 2026-05-23. Helios is 2026-05-22.
      // Larsen 2026-05-23 should beat Helios 2026-05-22.
      expect(result[0].filed).toBe("2026-05-23");
    });
  });
});

describe("describeQuery", () => {
  it("returns 'all cases' for an empty query", () => {
    expect(describeQuery({})).toBe("all cases");
  });

  it("returns 'all cases' when only scope=all is present", () => {
    expect(describeQuery({ scope: "all" })).toBe("all cases");
  });

  it("describes a text-only query", () => {
    expect(describeQuery({ q: "helios" })).toBe('text: "helios"');
  });

  it("describes a court-only query", () => {
    expect(describeQuery({ court: "S.D.N.Y." })).toBe("court: S.D.N.Y.");
  });

  it("describes a NOS-only query", () => {
    expect(describeQuery({ nos: "830" })).toBe("NOS 830");
  });

  it("describes a scope-only query", () => {
    expect(describeQuery({ scope: "patent" })).toBe("scope: patent");
  });

  it("omits scope when value is 'all'", () => {
    expect(describeQuery({ scope: "all", court: "D. Del." })).toBe(
      "court: D. Del."
    );
  });

  it("joins multiple filters with ' · '", () => {
    expect(
      describeQuery({
        q: "patent",
        court: "D. Del.",
        nos: "830",
        scope: "patent",
      })
    ).toBe('text: "patent" · court: D. Del. · NOS 830 · scope: patent');
  });

  it("preserves filter order: q, court, nos, scope", () => {
    const out = describeQuery({
      scope: "antitrust",
      nos: "410",
      court: "N.D. Cal.",
      q: "aurora",
    });
    expect(out).toBe(
      'text: "aurora" · court: N.D. Cal. · NOS 410 · scope: antitrust'
    );
  });

  it("treats null fields as absent", () => {
    expect(describeQuery({ q: null, court: null, nos: null, scope: null })).toBe(
      "all cases"
    );
  });
});
