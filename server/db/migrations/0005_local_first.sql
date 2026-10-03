CREATE TABLE `deleted_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`deleted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `note_members` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`label_id` text,
	`sort_key` text,
	`label_sort_key` text,
	`reminder_at` integer,
	`preview` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`note_id`, `user_id`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `note_members_user_id_idx` ON `note_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `note_members_reminder_at_idx` ON `note_members` (`reminder_at`);--> statement-breakpoint
ALTER TABLE `labels` ADD `sort_key` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `sort_key` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `label_sort_key` text;--> statement-breakpoint
DROP TRIGGER IF EXISTS `notes_insert_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `notes_update_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `notes_delete_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `labels_insert_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `labels_update_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `labels_delete_trigger`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `user_update_trigger`;--> statement-breakpoint
DROP TABLE IF EXISTS `change_logs`;
