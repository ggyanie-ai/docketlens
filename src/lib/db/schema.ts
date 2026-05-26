import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

/* =============================================================================
 *  DocketLens schema (Postgres / Neon)
 *
 *  Design notes:
 *   - Surrogate `id` is text (cuid/nanoid) for client-friendly URLs and to
 *     decouple from CourtListener's numeric IDs.
 *   - Every CourtListener-mirrored entity keeps its CL id under `cl_id` for
 *     re-fetch + dedupe.
 *   - Timestamps are TIMESTAMPTZ (was unix ms on the original SQLite layout);
 *     Drizzle drops them in as JS Date objects.
 *   - Soft-delete via `deleted_at` for user-owned data; hard-delete for cache.
 *   - jsonb (not text) for everything previously `mode: "json"`.
 * ===========================================================================*/

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

/* -------------------- Users / Orgs / Auth ------------------- */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const accounts = pgTable(
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
    expiresAt: timestamp("expires_at", { withTimezone: true }),
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

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verifications_id_value_idx").on(t.identifier, t.value)]
);

export const orgs = pgTable("orgs", {
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

export const orgMembers = pgTable(
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

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    tokenPrefix: text("token_prefix").notNull(),
    scopes: jsonb("scopes").notNull().default([]).$type<string[]>(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("api_keys_org_idx").on(t.orgId)]
);

/* -------------------- Court entities (cached from CourtListener) -------- */

export const courts = pgTable("courts", {
  id: text("id").primaryKey(), // CL slug e.g. "nysd", "cand"
  fullName: text("full_name").notNull(),
  shortName: text("short_name").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // F, FB, FS, FD, etc.
  citationString: text("citation_string"),
  inUse: boolean("in_use").notNull().default(true),
  ...timestamps,
});

export const dockets = pgTable(
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
    dateFiled: timestamp("date_filed", { withTimezone: true }),
    dateTerminated: timestamp("date_terminated", { withTimezone: true }),
    dateLastFiling: timestamp("date_last_filing", { withTimezone: true }),
    assignedTo: text("assigned_to"), // judge name (resolved separately)
    referredTo: text("referred_to"),
    appellateCaseTypeInformation: text("appellate_case_type"),
    sourceCount: integer("source_count").notNull().default(0),
    raw: jsonb("raw").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("dockets_court_idx").on(t.court),
    index("dockets_date_filed_idx").on(t.dateFiled),
    index("dockets_case_name_idx").on(t.caseName),
  ]
);

export const docketEntries = pgTable(
  "docket_entries",
  {
    id: text("id").primaryKey(),
    clId: integer("cl_id").notNull().unique(),
    docketId: text("docket_id")
      .notNull()
      .references(() => dockets.id, { onDelete: "cascade" }),
    entryNumber: integer("entry_number"),
    dateFiled: timestamp("date_filed", { withTimezone: true }),
    description: text("description").notNull().default(""),
    shortDescription: text("short_description"),
    documentNumber: text("document_number"),
    raw: jsonb("raw").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("entries_docket_idx").on(t.docketId, t.dateFiled),
    index("entries_date_idx").on(t.dateFiled),
  ]
);

export const parties = pgTable(
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

export const attorneys = pgTable(
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

export const partyAttorneys = pgTable(
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

export const judges = pgTable(
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

export const watchlists = pgTable(
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
    filters: jsonb("filters")
      .notNull()
      .default({})
      .$type<{
        courts?: string[];
        natureOfSuitCodes?: string[];
        caseTypes?: string[];
        partyRoles?: string[];
        minDemand?: number;
        startDate?: string;
        endDate?: string;
      }>(),
    isActive: boolean("is_active").notNull().default(true),
    refreshCadence: text("refresh_cadence", {
      enum: ["realtime", "hourly", "daily"],
    })
      .notNull()
      .default("daily"),
    // Pro+ ranking field — higher priority watchlists ship to the top of
    // daily digests + show first in the dashboard "your watchlists" list.
    // 0..100; default 50. UI for adjusting it lands in 0.2.0.
    priority: integer("priority").notNull().default(50),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    matchCount: integer("match_count").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("watchlists_org_idx").on(t.orgId),
    index("watchlists_active_idx").on(t.isActive, t.refreshCadence),
    index("watchlists_priority_idx").on(t.orgId, t.priority),
  ]
);

export const watchlistMatches = pgTable(
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
    matchedAt: timestamp("matched_at", { withTimezone: true }).notNull().defaultNow(),
    matchReason: text("match_reason"),
    score: doublePrecision("score"),
  },
  (t) => [
    index("matches_watchlist_idx").on(t.watchlistId, t.matchedAt),
    uniqueIndex("matches_dedupe_idx").on(t.watchlistId, t.docketId, t.entryId),
  ]
);

export const alertRules = pgTable(
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
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("alert_rules_watchlist_idx").on(t.watchlistId)]
);

export const alertDeliveries = pgTable(
  "alert_deliveries",
  {
    id: text("id").primaryKey(),
    ruleId: text("rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    payload: jsonb("payload")
      .notNull()
      .$type<{ matches: string[]; subject: string; body: string }>(),
    status: text("status", { enum: ["queued", "sent", "failed", "skipped"] })
      .notNull()
      .default("queued"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    error: text("error"),
    ...timestamps,
  },
  (t) => [index("deliveries_rule_idx").on(t.ruleId, t.status)]
);

/* -------------------- AI summaries (cached) ------------------- */

export const aiSummaries = pgTable(
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

export const savedSearches = pgTable("saved_searches", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  query: jsonb("query").notNull().$type<Record<string, unknown>>(),
  isPinned: boolean("is_pinned").notNull().default(false),
  ...timestamps,
});

/* -------------------- Docket notes ------------------- */

/* Private per-org annotation attached to a docket. Markdown body, one row
   per (org, docket) — replace-on-write. Lives separately from `dockets`
   because the docket row is shared across orgs; notes are scoped. */
export const docketNotes = pgTable(
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

export const auditEvents = pgTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").references(() => orgs.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    target: text("target"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_org_idx").on(t.orgId, t.occurredAt),
    index("audit_action_idx").on(t.action),
  ]
);

// Silence unused-import warning for `sql` (kept for any inline raw fragments
// in derived queries elsewhere in the codebase).
export { sql };

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
