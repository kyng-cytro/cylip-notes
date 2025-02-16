DROP TABLE `label_settings`;--> statement-breakpoint
DROP TABLE `note_settings`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_labels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`user_id` text NOT NULL,
	`options` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_labels`("id", "name", "slug", "user_id", "options", "created_at", "updated_at") SELECT "id", "name", "slug", "user_id", "options", "created_at", "updated_at" FROM `labels`;--> statement-breakpoint
DROP TABLE `labels`;--> statement-breakpoint
ALTER TABLE `__new_labels` RENAME TO `labels`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `labels_slug_user_id_unique` ON `labels` (`slug`,`user_id`);--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`title` text,
	`content` text,
	`options` text,
	`pinned` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`trashed` integer DEFAULT false NOT NULL,
	`label_id` text,
	`user_id` text NOT NULL,
	`reminder_at` integer,
	`trashed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "slug", "title", "content", "options", "pinned", "archived", "trashed", "label_id", "user_id", "reminder_at", "trashed_at", "created_at", "updated_at") SELECT "id", "slug", "title", "content", "options", "pinned", "archived", "trashed", "label_id", "user_id", "reminder_at", "trashed_at", "created_at", "updated_at" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;