CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"tier" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"content" text NOT NULL,
	"tokens_in" integer,
	"tokens_out" integer,
	"source_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"sent_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"watchlist_id" text NOT NULL,
	"channel" text NOT NULL,
	"target" text NOT NULL,
	"digest_cadence" text DEFAULT 'daily' NOT NULL,
	"digest_hour" integer DEFAULT 7,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"token_prefix" text NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "attorneys" (
	"id" text PRIMARY KEY NOT NULL,
	"cl_id" integer,
	"name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"contact_raw" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attorneys_cl_id_unique" UNIQUE("cl_id")
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"user_id" text,
	"action" text NOT NULL,
	"target" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courts" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"short_name" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"citation_string" text,
	"in_use" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "docket_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"cl_id" integer NOT NULL,
	"docket_id" text NOT NULL,
	"entry_number" integer,
	"date_filed" timestamp with time zone,
	"description" text DEFAULT '' NOT NULL,
	"short_description" text,
	"document_number" text,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "docket_entries_cl_id_unique" UNIQUE("cl_id")
);
--> statement-breakpoint
CREATE TABLE "docket_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"docket_id" text NOT NULL,
	"author_id" text,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dockets" (
	"id" text PRIMARY KEY NOT NULL,
	"cl_id" integer NOT NULL,
	"court" text NOT NULL,
	"case_name" text NOT NULL,
	"case_name_short" text,
	"docket_number" text,
	"pacer_case_id" text,
	"nature_of_suit" text,
	"cause" text,
	"jury_demand" text,
	"date_filed" timestamp with time zone,
	"date_terminated" timestamp with time zone,
	"date_last_filing" timestamp with time zone,
	"assigned_to" text,
	"referred_to" text,
	"appellate_case_type" text,
	"source_count" integer DEFAULT 0 NOT NULL,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dockets_cl_id_unique" UNIQUE("cl_id")
);
--> statement-breakpoint
CREATE TABLE "judges" (
	"id" text PRIMARY KEY NOT NULL,
	"cl_id" integer,
	"name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"court" text,
	"position_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "judges_cl_id_unique" UNIQUE("cl_id")
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_members_org_id_user_id_pk" PRIMARY KEY("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"owner_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orgs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "parties" (
	"id" text PRIMARY KEY NOT NULL,
	"cl_id" integer,
	"docket_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"extra_info" text,
	"name_normalized" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parties_cl_id_unique" UNIQUE("cl_id")
);
--> statement-breakpoint
CREATE TABLE "party_attorneys" (
	"party_id" text NOT NULL,
	"attorney_id" text NOT NULL,
	CONSTRAINT "party_attorneys_party_id_attorney_id_pk" PRIMARY KEY("party_id","attorney_id")
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"query" jsonb NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"watchlist_id" text NOT NULL,
	"docket_id" text NOT NULL,
	"entry_id" text,
	"matched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"match_reason" text,
	"score" double precision
);
--> statement-breakpoint
CREATE TABLE "watchlists" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT 'amber',
	"entity_type" text NOT NULL,
	"match_value" text NOT NULL,
	"match_value_normalized" text NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"refresh_cadence" text DEFAULT 'daily' NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"last_run_at" timestamp with time zone,
	"match_count" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_watchlist_id_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."watchlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docket_entries" ADD CONSTRAINT "docket_entries_docket_id_dockets_id_fk" FOREIGN KEY ("docket_id") REFERENCES "public"."dockets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docket_notes" ADD CONSTRAINT "docket_notes_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docket_notes" ADD CONSTRAINT "docket_notes_docket_id_dockets_id_fk" FOREIGN KEY ("docket_id") REFERENCES "public"."dockets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docket_notes" ADD CONSTRAINT "docket_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dockets" ADD CONSTRAINT "dockets_court_courts_id_fk" FOREIGN KEY ("court") REFERENCES "public"."courts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judges" ADD CONSTRAINT "judges_court_courts_id_fk" FOREIGN KEY ("court") REFERENCES "public"."courts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parties" ADD CONSTRAINT "parties_docket_id_dockets_id_fk" FOREIGN KEY ("docket_id") REFERENCES "public"."dockets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_attorneys" ADD CONSTRAINT "party_attorneys_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_attorneys" ADD CONSTRAINT "party_attorneys_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_matches" ADD CONSTRAINT "watchlist_matches_watchlist_id_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."watchlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_matches" ADD CONSTRAINT "watchlist_matches_docket_id_dockets_id_fk" FOREIGN KEY ("docket_id") REFERENCES "public"."dockets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_matches" ADD CONSTRAINT "watchlist_matches_entry_id_docket_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."docket_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_summaries_dedupe_idx" ON "ai_summaries" USING btree ("entity_type","entity_id","tier","prompt_version");--> statement-breakpoint
CREATE INDEX "deliveries_rule_idx" ON "alert_deliveries" USING btree ("rule_id","status");--> statement-breakpoint
CREATE INDEX "alert_rules_watchlist_idx" ON "alert_rules" USING btree ("watchlist_id");--> statement-breakpoint
CREATE INDEX "api_keys_org_idx" ON "api_keys" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "attorneys_name_idx" ON "attorneys" USING btree ("name_normalized");--> statement-breakpoint
CREATE INDEX "audit_org_idx" ON "audit_events" USING btree ("org_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "entries_docket_idx" ON "docket_entries" USING btree ("docket_id","date_filed");--> statement-breakpoint
CREATE INDEX "entries_date_idx" ON "docket_entries" USING btree ("date_filed");--> statement-breakpoint
CREATE UNIQUE INDEX "docket_notes_org_docket_idx" ON "docket_notes" USING btree ("org_id","docket_id");--> statement-breakpoint
CREATE INDEX "dockets_court_idx" ON "dockets" USING btree ("court");--> statement-breakpoint
CREATE INDEX "dockets_date_filed_idx" ON "dockets" USING btree ("date_filed");--> statement-breakpoint
CREATE INDEX "dockets_case_name_idx" ON "dockets" USING btree ("case_name");--> statement-breakpoint
CREATE INDEX "judges_name_idx" ON "judges" USING btree ("name_normalized");--> statement-breakpoint
CREATE INDEX "org_members_user_idx" ON "org_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "parties_docket_idx" ON "parties" USING btree ("docket_id");--> statement-breakpoint
CREATE INDEX "parties_name_idx" ON "parties" USING btree ("name_normalized");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_id_value_idx" ON "verifications" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "matches_watchlist_idx" ON "watchlist_matches" USING btree ("watchlist_id","matched_at");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_dedupe_idx" ON "watchlist_matches" USING btree ("watchlist_id","docket_id","entry_id");--> statement-breakpoint
CREATE INDEX "watchlists_org_idx" ON "watchlists" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "watchlists_active_idx" ON "watchlists" USING btree ("is_active","refresh_cadence");--> statement-breakpoint
CREATE INDEX "watchlists_priority_idx" ON "watchlists" USING btree ("org_id","priority");