/* ============================================================================
 *  Tiny CSV writer
 *
 *  Excel-compatible. Escapes quotes by doubling, wraps any field containing
 *  commas / quotes / newlines in double quotes. UTF-8 BOM in the download
 *  helper so Excel opens it without mojibake.
 * ==========================================================================*/

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeField).join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escapeField(r[h])).join(","));
  }
  return lines.join("\r\n");
}

function escapeField(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (v instanceof Date) s = v.toISOString();
  else if (Array.isArray(v)) s = v.join(" · ");
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  const csv = toCsv(rows);
  // BOM helps Excel detect UTF-8
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the blob URL after the click finishes
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
