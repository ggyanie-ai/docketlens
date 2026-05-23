import type { Docket, DocketEntry, WatchlistMatch } from "@/lib/db/schema";

/* ============================================================================
 *  Digest email renderer.
 *  Returns subject + plaintext + minimal HTML (no images, no tracking pixels).
 * ==========================================================================*/

export interface DigestItem {
  docket: Docket;
  entry: DocketEntry | null;
  match: WatchlistMatch;
}

const CADENCE_LABEL: Record<string, string> = {
  instant: "New match",
  hourly: "Hourly digest",
  daily: "Daily digest",
};

export function renderDigestEmail(args: {
  cadence: "instant" | "hourly" | "daily";
  items: DigestItem[];
}): { subject: string; body: string; html: string } {
  const { cadence, items } = args;
  const n = items.length;

  const subject =
    cadence === "instant"
      ? `${items[0]?.docket.caseName ?? "DocketLens"} — new filing`
      : `${CADENCE_LABEL[cadence]} — ${n} new ${n === 1 ? "filing" : "filings"}`;

  const grouped = groupBy(items, (i) => i.docket.id);

  const bodyLines: string[] = [];
  bodyLines.push(`DocketLens — ${CADENCE_LABEL[cadence]}`);
  bodyLines.push("");
  bodyLines.push(
    n === 1
      ? "There is 1 new filing matching your watchlists."
      : `There are ${n} new filings matching your watchlists.`
  );
  bodyLines.push("");

  for (const [, group] of grouped) {
    const head = group[0];
    bodyLines.push(`▸ ${head.docket.court ?? ""} · ${head.docket.docketNumber ?? ""}`);
    bodyLines.push(`  ${head.docket.caseName}`);
    for (const item of group) {
      const dt = item.entry?.dateFiled?.toISOString().slice(0, 10) ?? "";
      bodyLines.push(`  · ${dt}  ${item.entry?.shortDescription ?? "—"}`);
    }
    bodyLines.push("");
  }

  bodyLines.push("Open in DocketLens: https://docketlens.ai/alerts");
  bodyLines.push("");
  bodyLines.push("Manage alerts: https://docketlens.ai/alerts");
  bodyLines.push("Unsubscribe:    https://docketlens.ai/unsubscribe");

  const body = bodyLines.join("\n");

  // Minimal HTML — table-friendly, no JS, no images
  const htmlGroups = Array.from(grouped.values())
    .map((group) => {
      const head = group[0];
      const rows = group
        .map((it) => {
          const dt = it.entry?.dateFiled?.toISOString().slice(0, 10) ?? "";
          return `<tr><td style="padding:6px 0;color:#9aa0aa;font-family:ui-monospace,monospace;font-size:12px;">${dt}</td><td style="padding:6px 0 6px 12px;font-size:14px;">${escapeHtml(it.entry?.shortDescription ?? "—")}</td></tr>`;
        })
        .join("\n");
      return `
        <tr><td style="padding:18px 0 6px;">
          <div style="font-family:ui-monospace,monospace;font-size:11px;color:#9aa0aa;letter-spacing:0.06em;">${escapeHtml(head.docket.court ?? "")} · ${escapeHtml(head.docket.docketNumber ?? "")}</div>
          <div style="font-size:16px;font-weight:600;margin-top:4px;">${escapeHtml(head.docket.caseName)}</div>
          <table style="margin-top:8px;border-collapse:collapse;">${rows}</table>
        </td></tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#0f1115;color:#e6e6e8;font-family:-apple-system,Segoe UI,Inter,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f1115;padding:28px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#15171c;border:1px solid #23262f;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 24px 12px;">
          <div style="font-family:'Instrument Serif',Georgia,serif;font-size:22px;">DocketLens</div>
          <div style="margin-top:4px;font-size:12px;color:#9aa0aa;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(CADENCE_LABEL[cadence])}</div>
        </td></tr>
        <tr><td style="padding:8px 24px 0;font-size:14px;color:#cccdd2;">${n === 1 ? "1 new filing" : `${n} new filings`} matching your watchlists.</td></tr>
        <tr><td style="padding:0 24px 24px;">
          <table style="width:100%;border-collapse:collapse;">${htmlGroups}</table>
        </td></tr>
        <tr><td style="padding:18px 24px;background:#1a1d24;border-top:1px solid #23262f;font-size:12px;color:#9aa0aa;">
          <a href="https://docketlens.ai/alerts" style="color:#ffb454;text-decoration:none;">Open in DocketLens</a>
          &nbsp;·&nbsp;
          <a href="https://docketlens.ai/settings" style="color:#9aa0aa;text-decoration:none;">Manage alerts</a>
          &nbsp;·&nbsp;
          <a href="https://docketlens.ai/unsubscribe" style="color:#9aa0aa;text-decoration:none;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, body, html };
}

function groupBy<T, K>(arr: T[], k: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of arr) {
    const key = k(item);
    const bucket = m.get(key);
    if (bucket) bucket.push(item);
    else m.set(key, [item]);
  }
  return m;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
