CREATE TABLE IF NOT EXISTS `change_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`table_name` text NOT NULL,
	`operation` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `change_logs_user_id_unique` ON `change_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `labels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `labels_slug_user_id_unique` ON `labels` (`slug`,`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`title` text,
	`settings_id` text,
	`content` text,
	`show_preview` integer DEFAULT true NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`trashed` integer DEFAULT false NOT NULL,
	`label_id` text,
	`user_id` text NOT NULL,
	`trashed_at` integer,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`settings_id`) REFERENCES `note_settings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `note_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`background_type` text,
	`background_value` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`google_id` text,
	`picture` text,
	`tokens` integer DEFAULT 100 NOT NULL,
	`joined_via` text NOT NULL,
	`account_type` text DEFAULT 'free' NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_google_id_unique` ON `users` (`google_id`);
