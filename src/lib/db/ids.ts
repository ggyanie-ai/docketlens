import { customAlphabet } from "nanoid";

/** URL-safe, sortable-ish id (24 chars). Avoids ambiguous glyphs. */
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz";
const make = customAlphabet(alphabet, 22);

export function newId(prefix?: string) {
  const body = make();
  return prefix ? `${prefix}_${body}` : body;
}

export const ids = {
  user: () => newId("usr"),
  session: () => newId("sess"),
  account: () => newId("acc"),
  verification: () => newId("ver"),
  org: () => newId("org"),
  apiKey: () => newId("key"),
  docket: () => newId("dkt"),
  entry: () => newId("ent"),
  party: () => newId("pty"),
  attorney: () => newId("att"),
  judge: () => newId("jdg"),
  watchlist: () => newId("wl"),
  match: () => newId("mat"),
  rule: () => newId("rule"),
  delivery: () => newId("del"),
  summary: () => newId("sum"),
  search: () => newId("sch"),
  audit: () => newId("aud"),
};

export function normalizeEntityName(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,'`"]/g, "")
    .replace(/\b(inc|incorporated|llc|llp|lp|corp|corporation|co|company|ltd|limited|plc|sa|gmbh|ag)\b\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
