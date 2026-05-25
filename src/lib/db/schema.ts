import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

/* =============================================================================
 *  DocketLens schema
 *
 *  Design notes:
 *   - Surrogate `id` is text (cuid/nanoid) for client-friendly URLs and to
 *     decouple from CourtListener's numeric IDs.
 *   - Every CourtListener-mirrored entity keeps its CL id under `cl_id` for
 *     re-fetch + dedupe.
 *   - Timestamps are unix ms (sqlite-friendly, easy to migrate to Postgres).
 *   - Soft-delete via `deleted_at` for user-owned data; hard-delete for cache.
 * ===========================================================================*/

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('now') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('now') * 1000)`),
};

/* -------------------- Users / Orgs / Auth ------------------- */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  name: text("name"),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  ...timestamps,
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("accounts_provider_idx").on(t.provider, t.providerAccountId),
    index("accounts_user_idx").on(t.userId),
  ]
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...timestamps,
  },
  (t) => [index("verifications_id_value_idx").on(t.identifier, t.value)]
);

export const orgs = sqliteTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan", { enum: ["free", "pro", "team", "enterprise"] })
    .notNull()
    .default("free"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  ...timestamps,
});

export const orgMembers = sqliteTable(
  "org_members",
  {
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "member"] })
      .notNull()
      .default("member"),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.orgId, t.userId] }),
    index("org_members_user_idx").on(t.userId),
  ]
);

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    tokenPrefix: text("token_prefix").notNull(),
    scopes: text("scopes", { mode: "json" })
      .notNull()
      .default(sql`'[]'`)
      .$type<string[]>(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [index("api_keys_org_idx").on(t.orgId)]
);

/* -------------------- Court entities (cached from CourtListener) -------- */

export const courts = sqliteTable("courts", {
  id: text("id").primaryKey(), // CL slug e.g. "nysd", "cand"
  fullName: text("full_name").notNull(),
  shortName: text("short_name").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // F, FB, FS, FD, etc.
  citationString: text("citation_string"),
  inUse: integer("in_use", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const dockets = sqliteTable(
  "dockets",
  {
    id: text("id").primaryKey(), // our cuid
    clId: integer("cl_id").notNull().unique(), // CourtListener docket id
    court: text("court")
      .notNull()
      .references(() => courts.id),
    caseName: text("case_name").notNull(),
    caseNameShort: text("case_name_short"),
    docketNumber: text("docket_number"),
    pacerCaseId: text("pacer_case_id"),
    natureOfSuit: text("nature_of_suit"),
    cause: text("cause"),
    juryDemand: text("jury_demand"),
    dateFiled: integer("date_filed", { mode: "timestamp_ms" }),
    dateTerminated: integer("date_terminated", { mode: "timestamp_ms" }),
    dateLastFiling: integer("date_last_filing", { mode: "timestamp_ms" }),
    assignedTo: text("assigned_to"), // judge name (resolved separately)
    referredTo: text("referred_to"),
    appellateCaseTypeInformation: text("appellate_case_type"),
    sourceCount: integer("source_count").notNull().default(0),
    raw: text("raw", { mode: "json" }).$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("dockets_court_idx").on(t.court),
    index("dockets_date_filed_idx").on(t.dateFiled),
    index("dockets_case_name_idx").on(t.caseName),
  ]
);

export const docketEntries = sqliteTable(
  "docket_entries",
  {
    id: text("id").primaryKey(),
    clId: integer("cl_id").notNull().unique(),
    docketId: text("docket_id")
      .notNull()
      .references(() => dockets.id, { onDelete: "cascade" }),
    entryNumber: integer("entry_number"),
    dateFiled: integer("date_filed", { mode: "timestamp_ms" }),
    description: text("description").notNull().default(""),
    shortDescription: text("short_description"),
    documentNumber: text("document_number"),
    raw: text("raw", { mode: "json" }).$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("entries_docket_idx").on(t.docketId, t.dateFiled),
    index("entries_date_idx").on(t.dateFiled),
  ]
);

export const parties = sqliteTable(
  "parties",
  {
    id: text("id").primaryKey(),
    clId: integer("cl_id").unique(),
    docketId: text("docket_id")
      .notNull()
      .references(() => dockets.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role"), // plaintiff, defendant, etc.
    extraInfo: text("extra_info"),
    nameNormalized: text("name_normalized").notNull(), // lowercased for matching
    ...timestamps,
  },
  (t) => [
    index("parties_docket_idx").on(t.docketId),
    index("parties_name_idx").on(t.nameNormalized),
  ]
);

export const attorneys = sqliteTable(
  "attorneys",
  {
    id: text("id").primaryKey(),
    clId: integer("cl_id").unique(),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized").notNull(),
    contactRaw: text("contact_raw"),
    ...timestamps,
  },
  (t) => [index("attorneys_name_idx").on(t.nameNormalized)]
);

export const partyAttorneys = sqliteTable(
  "party_attorneys",
  {
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    attorneyId: text("attorney_id")
      .notNull()
      .references(() => attorneys.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.partyId, t.attorneyId] })]
);

export const judges = sqliteTable(
  "judges",
  {
    id: text("id").primaryKey(),
    clId: integer("cl_id").unique(),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized").notNull(),
    court: text("court").references(() => courts.id),
    positionType: text("position_type"),
    ...timestamps,
  },
  (t) => [index("judges_name_idx").on(t.nameNormalized)]
);

/* -------------------- Watchlists + Alerts ------------------- */

export const watchlists = sqliteTable(
  "watchlists",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("amber"),
    entityType: text("entity_type", {
      enum: ["party", "attorney", "judge", "lawfirm", "case", "term"],
    }).notNull(),
    matchValue: text("match_value").notNull(), // string to match
    matchValueNormalized: text("match_value_normalized").notNull(),
    filters: text("filters", { mode: "json" })
      .notNull()
      .default(sql`'{}'`)
      .$type<{
        courts?: string[];
        natureOfSuitCodes?: string[];
        caseTypes?: string[];
        partyRoles?: string[];
        minDemand?: number;
        startDate?: string;
        endDate?: string;
      }>(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    refreshCadence: text("refresh_cadence", {
      enum: ["realtime", "hourly", "daily"],
    })
      .notNull()
      .default("daily"),
    // Pro+ ranking field — higher priority watchlists ship to the top of
    // daily digests + show first in the dashboard "your watchlists" list.
    // 0..100; default 50. UI for adjusting it lands in 0.2.0.
    priority: integer("priority").notNull().default(50),
    lastRunAt: integer("last_run_at", { mode: "timestamp_ms" }),
    matchCount: integer("match_count").notNull().default(0),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (t) => [
    index("watchlists_org_idx").on(t.orgId),
    index("watchlists_active_idx").on(t.isActive, t.refreshCadence),
    index("watchlists_priority_idx").on(t.orgId, t.priority),
  ]
);

export const watchlistMatches = sqliteTable(
  "watchlist_matches",
  {
    id: text("id").primaryKey(),
    watchlistId: text("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    docketId: text("docket_id")
      .notNull()
      .references(() => dockets.id, { onDelete: "cascade" }),
    entryId: text("entry_id").references(() => docketEntries.id, { onDelete: "cascade" }),
    matchedAt: integer("matched_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('now') * 1000)`),
    matchReason: text("match_reason"),
    score: real("score"),
  },
  (t) => [
    index("matches_watchlist_idx").on(t.watchlistId, t.matchedAt),
    uniqueIndex("matches_dedupe_idx").on(t.watchlistId, t.docketId, t.entryId),
  ]
);

export const alertRules = sqliteTable(
  "alert_rules",
  {
    id: text("id").primaryKey(),
    watchlistId: text("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    channel: text("channel", {
      enum: ["email", "webhook", "in_app"],
    }).notNull(),
    target: text("target").notNull(), // email address or webhook URL
    digestCadence: text("digest_cadence", {
      enum: ["instant", "hourly", "daily"],
    })
      .notNull()
      .default("daily"),
    digestHour: integer("digest_hour").default(7), // 24h, user-local
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [index("alert_rules_watchlist_idx").on(t.watchlistId)]
);

export const alertDeliveries = sqliteTable(
  "alert_deliveries",
  {
    id: text("id").primaryKey(),
    ruleId: text("rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    payload: text("payload", { mode: "json" })
      .notNull()
      .$type<{ matches: string[]; subject: string; body: string }>(),
    status: text("status", { enum: ["queued", "sent", "failed", "skipped"] })
      .notNull()
      .default("queued"),
    sentAt: integer("sent_at", { mode: "timestamp_ms" }),
    error: text("error"),
    ...timestamps,
  },
  (t) => [index("deliveries_rule_idx").on(t.ruleId, t.status)]
);

/* -------------------- AI summaries (cached) ------------------- */

export const aiSummaries = sqliteTable(
  "ai_summaries",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type", { enum: ["docket", "entry", "complaint"] }).notNull(),
    entityId: text("entity_id").notNull(),
    tier: text("tier", { enum: ["one_liner", "paragraph", "exec"] }).notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    content: text("content").notNull(),
    tokensIn: integer("tokens_in"),
    tokensOut: integer("tokens_out"),
    sourceHash: text("source_hash"), // sha256 of source — invalidate on change
    ...timestamps,
  },
  (t) => [
    uniqueIndex("ai_summaries_dedupe_idx").on(
      t.entityType,
      t.entityId,
      t.tier,
      t.promptVersion
    ),
  ]
);

/* -------------------- Saved searches ------------------- */

export const savedSearches = sqliteTable("saved_searches", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  query: text("query", { mode: "json" })
    .notNull()
    .$type<Record<string, unknown>>(),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

/* -------------------- Docket notes ------------------- */

/* Private per-org annotation attached to a docket. Markdown body, one row
   per (org, docket) — replace-on-write. Lives separately from `dockets`
   because the docket row is shared across orgs; notes are scoped. */
export const docketNotes = sqliteTable(
  "docket_notes",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    docketId: text("docket_id")
      .notNull()
      .references(() => dockets.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull().default(""),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("docket_notes_org_docket_idx").on(t.orgId, t.docketId),
  ]
);

/* -------------------- Audit log ------------------- */

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").references(() => orgs.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    target: text("target"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => [
    index("audit_org_idx").on(t.orgId, t.occurredAt),
    index("audit_action_idx").on(t.action),
  ]
);

/* -------------------- Type exports ------------------- */

export type User = typeof users.$inferSelect;
export type Org = typeof orgs.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type Docket = typeof dockets.$inferSelect;
export type DocketEntry = typeof docketEntries.$inferSelect;
export type Party = typeof parties.$inferSelect;
export type Watchlist = typeof watchlists.$inferSelect;
export type WatchlistMatch = typeof watchlistMatches.$inferSelect;
export type AlertRule = typeof alertRules.$inferSelect;
export type AiSummary = typeof aiSummaries.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type DocketNote = typeof docketNotes.$inferSelect;
