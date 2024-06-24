ALTER TABLE `user` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `google_id` text;--> statement-breakpoint
ALTER TABLE `user` ADD `picture` text;--> statement-breakpoint
ALTER TABLE `user` ADD `created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_google_id_unique` ON `user` (`google_id`);