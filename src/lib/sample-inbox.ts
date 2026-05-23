import { SAMPLE_DOCKETS, SAMPLE_WATCHLISTS } from "@/lib/sample-data";

/* ============================================================================
 *  Sample inbox messages — deterministic synthetic in-app alert deliveries
 *  matching the shape of `alert_deliveries` rows where channel='in_app'.
 *
 *  Each message references a real (sample) docket entry plus the watchlist
 *  that triggered it. When real DB queries land Tuesday we replace this with
 *  `db.select().from(alertDeliveries)…`.
 * ==========================================================================*/

export type InboxStatus = "unread" | "read" | "archived";

export interface InboxMessage {
  id: string;
  watchlistId: string;
  watchlistName: string;
  watchlistColor: string;
  docketId: string;
  entryId: string;
  caseName: string;
  court: string;
  caseNumber: string;
  filingType: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO
  status: InboxStatus;
}

function pickEntry(docketId: string) {
  const d = SAMPLE_DOCKETS.find((d) => d.id === docketId);
  if (!d) return null;
  return { docket: d, entry: d.entries[d.entries.length - 1] };
}

const RECIPE: Array<{
  watchlistId: string;
  docketId: string;
  hoursAgo: number;
  status: InboxStatus;
}> = [
  { watchlistId: "wl_securities_sdny", docketId: "dkt_larsen_v_crestmark", hoursAgo: 0.2, status: "unread" },
  { watchlistId: "wl_judge_alsup",     docketId: "dkt_ftc_v_aurora",        hoursAgo: 0.8, status: "unread" },
  { watchlistId: "wl_kirkland",        docketId: "dkt_helios_v_northgate",  hoursAgo: 1.4, status: "unread" },
  { watchlistId: "wl_kirkland",        docketId: "dkt_optera_v_arm",        hoursAgo: 3.2, status: "unread" },
  { watchlistId: "wl_securities_sdny", docketId: "dkt_sec_v_meridian",      hoursAgo: 7,   status: "read" },
  { watchlistId: "wl_judge_alsup",     docketId: "dkt_helios_v_northgate",  hoursAgo: 24,  status: "read" },
  { watchlistId: "wl_apple",           docketId: "dkt_optera_v_arm",        hoursAgo: 48,  status: "read" },
  { watchlistId: "wl_kirkland",        docketId: "dkt_ftc_v_aurora",        hoursAgo: 71,  status: "read" },
  { watchlistId: "wl_securities_sdny", docketId: "dkt_larsen_v_crestmark",  hoursAgo: 96,  status: "archived" },
];

export const SAMPLE_INBOX: InboxMessage[] = RECIPE.map((r, i) => {
  const wl = SAMPLE_WATCHLISTS.find((w) => w.id === r.watchlistId)!;
  const found = pickEntry(r.docketId)!;
  const d = found.docket;
  const e = found.entry;
  return {
    id: `inb_${String(i + 1).padStart(2, "0")}`,
    watchlistId: r.watchlistId,
    watchlistName: wl.name,
    watchlistColor: wl.color,
    docketId: d.id,
    entryId: e.id,
    caseName: d.caseName,
    court: d.court,
    caseNumber: d.caseNumber,
    filingType: e.type,
    subject: `${d.caseNameShort ?? d.caseName} — ${e.short}`,
    body: e.summaryOne ?? e.short,
    receivedAt: new Date(Date.now() - r.hoursAgo * 3_600_000).toISOString(),
    status: r.status,
  };
});
