CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_idx` ON `accounts` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `ai_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`tier` text NOT NULL,
	`model` text NOT NULL,
	`prompt_version` text NOT NULL,
	`content` text NOT NULL,
	`tokens_in` integer,
	`tokens_out` integer,
	`source_hash` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_summaries_dedupe_idx` ON `ai_summaries` (`entity_type`,`entity_id`,`tier`,`prompt_version`);--> statement-breakpoint
CREATE TABLE `alert_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`sent_at` integer,
	`error` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `alert_rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deliveries_rule_idx` ON `alert_deliveries` (`rule_id`,`status`);--> statement-breakpoint
CREATE TABLE `alert_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`watchlist_id` text NOT NULL,
	`channel` text NOT NULL,
	`target` text NOT NULL,
	`digest_cadence` text DEFAULT 'daily' NOT NULL,
	`digest_hour` integer DEFAULT 7,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `alert_rules_watchlist_idx` ON `alert_rules` (`watchlist_id`);--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`token_prefix` text NOT NULL,
	`scopes` text DEFAULT '[]' NOT NULL,
	`last_used_at` integer,
	`expires_at` integer,
	`revoked_at` integer,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_token_hash_unique` ON `api_keys` (`token_hash`);--> statement-breakpoint
CREATE INDEX `api_keys_org_idx` ON `api_keys` (`org_id`);--> statement-breakpoint
CREATE TABLE `attorneys` (
	`id` text PRIMARY KEY NOT NULL,
	`cl_id` integer,
	`name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`contact_raw` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attorneys_cl_id_unique` ON `attorneys` (`cl_id`);--> statement-breakpoint
CREATE INDEX `attorneys_name_idx` ON `attorneys` (`name_normalized`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text,
	`user_id` text,
	`action` text NOT NULL,
	`target` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`occurred_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_org_idx` ON `audit_events` (`org_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_events` (`action`);--> statement-breakpoint
CREATE TABLE `courts` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`short_name` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`citation_string` text,
	`in_use` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `docket_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`cl_id` integer NOT NULL,
	`docket_id` text NOT NULL,
	`entry_number` integer,
	`date_filed` integer,
	`description` text DEFAULT '' NOT NULL,
	`short_description` text,
	`document_number` text,
	`raw` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`docket_id`) REFERENCES `dockets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `docket_entries_cl_id_unique` ON `docket_entries` (`cl_id`);--> statement-breakpoint
CREATE INDEX `entries_docket_idx` ON `docket_entries` (`docket_id`,`date_filed`);--> statement-breakpoint
CREATE INDEX `entries_date_idx` ON `docket_entries` (`date_filed`);--> statement-breakpoint
CREATE TABLE `dockets` (
	`id` text PRIMARY KEY NOT NULL,
	`cl_id` integer NOT NULL,
	`court` text NOT NULL,
	`case_name` text NOT NULL,
	`case_name_short` text,
	`docket_number` text,
	`pacer_case_id` text,
	`nature_of_suit` text,
	`cause` text,
	`jury_demand` text,
	`date_filed` integer,
	`date_terminated` integer,
	`date_last_filing` integer,
	`assigned_to` text,
	`referred_to` text,
	`appellate_case_type` text,
	`source_count` integer DEFAULT 0 NOT NULL,
	`raw` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`court`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dockets_cl_id_unique` ON `dockets` (`cl_id`);--> statement-breakpoint
CREATE INDEX `dockets_court_idx` ON `dockets` (`court`);--> statement-breakpoint
CREATE INDEX `dockets_date_filed_idx` ON `dockets` (`date_filed`);--> statement-breakpoint
CREATE INDEX `dockets_case_name_idx` ON `dockets` (`case_name`);--> statement-breakpoint
CREATE TABLE `judges` (
	`id` text PRIMARY KEY NOT NULL,
	`cl_id` integer,
	`name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`court` text,
	`position_type` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`court`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `judges_cl_id_unique` ON `judges` (`cl_id`);--> statement-breakpoint
CREATE INDEX `judges_name_idx` ON `judges` (`name_normalized`);--> statement-breakpoint
CREATE TABLE `org_members` (
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	PRIMARY KEY(`org_id`, `user_id`),
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `org_members_user_idx` ON `org_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `orgs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`owner_id` text NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orgs_slug_unique` ON `orgs` (`slug`);--> statement-breakpoint
CREATE TABLE `parties` (
	`id` text PRIMARY KEY NOT NULL,
	`cl_id` integer,
	`docket_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`extra_info` text,
	`name_normalized` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`docket_id`) REFERENCES `dockets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_cl_id_unique` ON `parties` (`cl_id`);--> statement-breakpoint
CREATE INDEX `parties_docket_idx` ON `parties` (`docket_id`);--> statement-breakpoint
CREATE INDEX `parties_name_idx` ON `parties` (`name_normalized`);--> statement-breakpoint
CREATE TABLE `party_attorneys` (
	`party_id` text NOT NULL,
	`attorney_id` text NOT NULL,
	PRIMARY KEY(`party_id`, `attorney_id`),
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attorney_id`) REFERENCES `attorneys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `saved_searches` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`created_by` text NOT NULL,
	`name` text NOT NULL,
	`query` text NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_id_value_idx` ON `verifications` (`identifier`,`value`);--> statement-breakpoint
CREATE TABLE `watchlist_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`watchlist_id` text NOT NULL,
	`docket_id` text NOT NULL,
	`entry_id` text,
	`matched_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`match_reason` text,
	`score` real,
	FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`docket_id`) REFERENCES `dockets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entry_id`) REFERENCES `docket_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `matches_watchlist_idx` ON `watchlist_matches` (`watchlist_id`,`matched_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `matches_dedupe_idx` ON `watchlist_matches` (`watchlist_id`,`docket_id`,`entry_id`);--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`created_by` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT 'amber',
	`entity_type` text NOT NULL,
	`match_value` text NOT NULL,
	`match_value_normalized` text NOT NULL,
	`filters` text DEFAULT '{}' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`refresh_cadence` text DEFAULT 'daily' NOT NULL,
	`last_run_at` integer,
	`match_count` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now') * 1000) NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `watchlists_org_idx` ON `watchlists` (`org_id`);--> statement-breakpoint
CREATE INDEX `watchlists_active_idx` ON `watchlists` (`is_active`,`refresh_cadence`);