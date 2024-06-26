ALTER TABLE `user` ADD `tokens` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `joined_via` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `account_type` text DEFAULT 'free' NOT NULL;