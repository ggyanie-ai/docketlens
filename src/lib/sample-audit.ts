/* ============================================================================
 *  Sample audit events — synthetic rows matching the `audit_events` schema.
 *  Deterministic timestamps so the demo is stable across reloads.
 * ==========================================================================*/

export type AuditCategory =
  | "auth"
  | "watchlist"
  | "key"
  | "alert"
  | "billing"
  | "data"
  | "settings";

export interface AuditEvent {
  id: string;
  category: AuditCategory;
  action: string; // e.g. "watchlist.create", "auth.login", "key.revoke"
  actor: {
    kind: "user" | "api_key" | "system";
    name: string;
    detail?: string; // email / key prefix / "system"
  };
  target?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  occurredAt: string; // ISO
}

function ago(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export const SAMPLE_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud_001",
    category: "auth",
    action: "auth.login",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { method: "magic_link", session_id: "sess_X9k2p" },
    occurredAt: ago(0.05),
  },
  {
    id: "aud_002",
    category: "watchlist",
    action: "watchlist.create",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "Apple Inc.",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { entity_type: "party", cadence: "daily" },
    occurredAt: ago(0.4),
  },
  {
    id: "aud_003",
    category: "key",
    action: "key.create",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "Slack worker · staging",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: {
      key_prefix: "dkl_live_qZ7",
      scopes: ["read:dockets", "read:watchlists"],
    },
    occurredAt: ago(1.1),
  },
  {
    id: "aud_004",
    category: "alert",
    action: "alert.delivery.failed",
    actor: { kind: "system", name: "Dispatch worker" },
    target: "Slack webhook (hooks.slack.com/…/x9k7)",
    metadata: { status: 503, retry_in_seconds: 300, attempt: 2 },
    occurredAt: ago(2.3),
  },
  {
    id: "aud_005",
    category: "watchlist",
    action: "watchlist.update",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "Securities — S.D.N.Y.",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { changed: ["cadence", "filters.natureOfSuitCodes"] },
    occurredAt: ago(4.7),
  },
  {
    id: "aud_006",
    category: "data",
    action: "ingest.complete",
    actor: { kind: "system", name: "Ingest worker · fly-ord-01" },
    metadata: {
      dockets_touched: 312,
      entries_inserted: 47,
      matches_materialized: 9,
      duration_ms: 11_842,
    },
    occurredAt: ago(8.2),
  },
  {
    id: "aud_007",
    category: "key",
    action: "key.revoke",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "Legacy CI key",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { key_prefix: "dkl_live_4Bk", reason: "rotation" },
    occurredAt: ago(20.4),
  },
  {
    id: "aud_008",
    category: "billing",
    action: "billing.invoice.sent",
    actor: { kind: "system", name: "Stripe webhook" },
    target: "ggyanie.ai@gmail.com",
    metadata: { invoice_id: "in_2L9Xz", amount_usd: 49.0, period: "monthly" },
    occurredAt: ago(28.1),
  },
  {
    id: "aud_009",
    category: "auth",
    action: "auth.session.revoked",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "iPhone · Safari · ip-104.28.x.x",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { session_id: "sess_K8jq3", reason: "manual" },
    occurredAt: ago(48),
  },
  {
    id: "aud_010",
    category: "settings",
    action: "org.member.invite",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "rachael.chen@example.com",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { role: "member", org: "DocketLens HQ" },
    occurredAt: ago(72),
  },
  {
    id: "aud_011",
    category: "alert",
    action: "alert.rule.create",
    actor: {
      kind: "user",
      name: "GG Yanie",
      detail: "ggyanie.ai@gmail.com",
    },
    target: "Hon. Alsup → email digest",
    ipAddress: "73.241.18.42",
    userAgent: "Safari 18 · macOS 15.4",
    metadata: { channel: "email", cadence: "hourly" },
    occurredAt: ago(96),
  },
  {
    id: "aud_012",
    category: "data",
    action: "ingest.rate_limited",
    actor: { kind: "system", name: "Ingest worker · fly-ord-01" },
    metadata: {
      endpoint: "/api/rest/v4/dockets/",
      retry_after_seconds: 30,
      remaining_today: 4,
    },
    occurredAt: ago(120),
  },
];
