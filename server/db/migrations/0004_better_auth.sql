-- Lucia -> Better Auth.
-- User rows are preserved; google ids move to `accounts`.
-- Lucia sessions/tokens are not compatible and are dropped (users sign in once).
-- NuxtHub runs statements one by one without a transaction, so everything that
-- can be is re-runnable, and the non-repeatable column changes come last.
CREATE TABLE IF NOT EXISTS `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `accounts_user_id_idx` ON `accounts` (`user_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `accounts` (`id`, `account_id`, `provider_id`, `user_id`, `created_at`, `updated_at`)
SELECT 'google_' || `id`, `google_id`, 'google', `id`, `created_at`, `updated_at`
FROM `users`
WHERE `google_id` IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `verifications_identifier_idx` ON `verifications` (`identifier`);
--> statement-breakpoint
DROP TABLE IF EXISTS `email_verification_tokens`;
--> statement-breakpoint
DROP TABLE IF EXISTS `sessions`;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sessions_token_unique` ON `sessions` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sessions_user_id_idx` ON `sessions` (`user_id`);
--> statement-breakpoint
-- Existing users have all signed in via magic link or Google, so their email is verified.
ALTER TABLE `users` ADD `email_verified` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE `users` SET `email_verified` = true;
--> statement-breakpoint
DROP INDEX IF EXISTS `users_google_id_unique`;
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `google_id`;
