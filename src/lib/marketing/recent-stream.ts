import { desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { docketEntries, dockets, courts } from "@/lib/db/schema";
import type { StreamEntry } from "@/components/marketing/live-docket-stream";

/* ============================================================================
 *  recentStreamEntries() — server-side fetcher for the homepage hero
 *
 *  Pulls the 5 most-recently-filed docket entries from the DB, joins the
 *  parent docket + court, and shapes them into the StreamEntry contract
 *  the <LiveDocketStream/> component expects.
 *
 *  Returns `[]` when the DB is empty (the cron may not have populated
 *  anything yet, OR CourtListener is mid-outage). The component falls
 *  back to its built-in FAUX sample stream and adjusts the disclaimer
 *  text accordingly — so the page never lies about what it's showing.
 *
 *  Cached at the request layer via Next's RSC cache. Hero is rendered
 *  on every homepage hit; we revalidate every 5 minutes so a freshly-
 *  cron'd entry surfaces within ~5 min without paying DB cost per
 *  visitor.
 * ==========================================================================*/

const SHORT_COURT: Record<string, string> = {
  nysd: "S.D.N.Y.",
  cand: "N.D. Cal.",
  ded: "D. Del.",
  txed: "E.D. Tex.",
  dcd: "D.D.C.",
  ilnd: "N.D. Ill.",
  njd: "D.N.J.",
  cacd: "C.D. Cal.",
  vaed: "E.D. Va.",
  nyed: "E.D.N.Y.",
};

function shortCourt(idOrShort: string | null | undefined): string {
  if (!idOrShort) return "—";
  if (idOrShort.length <= 9 && /[.]/.test(idOrShort)) return idOrShort;
  return SHORT_COURT[idOrShort.toLowerCase()] ?? idOrShort.toUpperCase();
}

function classifyType(desc: string): StreamEntry["type"] {
  const s = desc.toLowerCase();
  if (s.includes("complaint")) return "Complaint";
  if (s.includes("motion")) return "Motion";
  if (s.includes("order")) return "Order";
  if (s.includes("notice")) return "Notice";
  if (s.includes("verdict")) return "Verdict";
  if (s.includes("brief")) return "Brief";
  if (s.includes("stipulation")) return "Stipulation";
  return "Motion";
}

function relativeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

function tagFor(natureOfSuit: string | null): StreamEntry["tag"] | undefined {
  if (!natureOfSuit) return undefined;
  const s = natureOfSuit.toLowerCase();
  if (s.includes("patent")) return { variant: "accent", label: "Patent" };
  if (s.includes("securities")) return { variant: "danger", label: "Securities" };
  if (s.includes("antitrust")) return { variant: "warning", label: "Antitrust" };
  if (s.includes("trademark")) return { variant: "accent", label: "Trademark" };
  if (s.includes("copyright")) return { variant: "accent", label: "Copyright" };
  if (s.includes("contract")) return { variant: "info", label: "Contract" };
  if (s.includes("civil rights")) return { variant: "info", label: "Civil Rights" };
  return undefined;
}

export async function recentStreamEntries(limit = 5): Promise<StreamEntry[]> {
  try {
    const rows = await db
      .select({
        entryId: docketEntries.id,
        entryDate: docketEntries.dateFiled,
        entryDesc: docketEntries.description,
        entryShort: docketEntries.shortDescription,
        docketId: dockets.id,
        docketCl: dockets.clId,
        docketCaseName: dockets.caseName,
        docketShort: dockets.caseNameShort,
        docketNumber: dockets.docketNumber,
        docketNatureOfSuit: dockets.natureOfSuit,
        courtId: dockets.court,
        courtShort: courts.shortName,
      })
      .from(docketEntries)
      .leftJoin(dockets, eq(docketEntries.docketId, dockets.id))
      .leftJoin(courts, eq(dockets.court, courts.id))
      .where(isNotNull(docketEntries.dateFiled))
      .orderBy(desc(docketEntries.dateFiled))
      .limit(limit);
    return rows
      .filter((r) => r.entryDate)
      .map((r) => ({
        id: r.entryId,
        court: shortCourt(r.courtShort ?? r.courtId),
        caseNo: r.docketNumber ?? `cl-${r.docketCl ?? ""}`,
        case: r.docketShort ?? r.docketCaseName ?? "(unknown)",
        filed: relativeAgo(r.entryDate as Date),
        type: classifyType(r.entryShort ?? r.entryDesc ?? ""),
        summary: (r.entryShort ?? r.entryDesc ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 220),
        tag: tagFor(r.docketNatureOfSuit),
      }));
  } catch {
    return [];
  }
}
