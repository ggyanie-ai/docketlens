import { type NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { SAMPLE_DOCKETS, type SampleDocket } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/dockets/{id}/related?by=party|judge|lawfirm|tag&limit=10
 *
 *  Given a docket, returns up to N other dockets that share a party,
 *  judge, law firm (via counsel string), or tag with the input. Scoring
 *  is a simple count of shared signals — no ML, no fuzzy matching.
 *
 *  Today this scores against the seeded SAMPLE_DOCKETS set (which is
 *  what the rest of the API also falls back to). When the ingest worker
 *  fills the real `dockets` + `parties` + `attorneys` tables Tuesday,
 *  the scoring helper swaps to a DB-backed query without changing the
 *  response shape.
 *
 *  ?by= can be a single dimension (party | judge | lawfirm | tag) or
 *  unspecified (default: all four, score = sum). ?limit clamped 1..25.
 *  Self-match is always excluded.
 * ==========================================================================*/

type Dim = "party" | "judge" | "lawfirm" | "tag";
const VALID: Dim[] = ["party", "judge", "lawfirm", "tag"];

function parties(d: SampleDocket): Set<string> {
  return new Set(d.parties.map((p) => p.name));
}
function counsel(d: SampleDocket): Set<string> {
  // Counsel strings are tucked into the per-party `counsel` array on the
  // demo seed shape; flatten them for the law-firm dimension.
  const out = new Set<string>();
  for (const p of d.parties) {
    for (const c of p.counsel ?? []) out.add(c);
  }
  return out;
}
function tags(d: SampleDocket): Set<string> {
  return new Set(d.tags ?? []);
}

function intersect<T>(a: Set<T>, b: Set<T>): T[] {
  const out: T[] = [];
  for (const x of a) if (b.has(x)) out.push(x);
  return out;
}

function score(
  self: SampleDocket,
  other: SampleDocket,
  dims: Dim[]
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let s = 0;
  if (dims.includes("party")) {
    const shared = intersect(parties(self), parties(other));
    if (shared.length > 0) {
      s += shared.length * 3; // shared party is the strongest signal
      reasons.push(`shared party: ${shared.join(", ")}`);
    }
  }
  if (dims.includes("judge")) {
    if (self.judge && other.judge && self.judge === other.judge) {
      s += 2;
      reasons.push(`same judge (${self.judge})`);
    }
  }
  if (dims.includes("lawfirm")) {
    const shared = intersect(counsel(self), counsel(other));
    if (shared.length > 0) {
      s += shared.length * 2;
      reasons.push(`shared counsel: ${shared.join(", ")}`);
    }
  }
  if (dims.includes("tag")) {
    const shared = intersect(tags(self), tags(other));
    if (shared.length > 0) {
      s += shared.length;
      reasons.push(`shared tag: ${shared.join(", ")}`);
    }
  }
  return { score: s, reasons };
}

export async function OPTIONS() {
  return preflight();
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const { id } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const byRaw = sp.get("by");
  const dims: Dim[] = byRaw
    ? byRaw
        .split(",")
        .map((s) => s.trim())
        .filter((d): d is Dim => (VALID as string[]).includes(d))
    : ([...VALID] as Dim[]);
  if (dims.length === 0) {
    return err("invalid `by` — expected party | judge | lawfirm | tag", 400);
  }
  const limitRaw = Number(sp.get("limit") ?? "10");
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 10, 1),
    25
  );

  const self = SAMPLE_DOCKETS.find((d) => d.id === id);
  if (!self) return err("docket not found", 404);

  const scored = SAMPLE_DOCKETS
    .filter((d) => d.id !== self.id)
    .map((d) => ({ docket: d, ...score(self, d, dims) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ok({
    docket_id: self.id,
    by: dims,
    count: scored.length,
    related: scored.map((r) => ({
      id: r.docket.id,
      court: r.docket.court,
      case_name: r.docket.caseName,
      docket_number: r.docket.caseNumber,
      date_filed: r.docket.filed,
      score: r.score,
      reasons: r.reasons,
    })),
  });
}
