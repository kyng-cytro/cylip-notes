ALTER TABLE `notes` ADD `archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `trashed` integer DEFAULT false NOT NULL;