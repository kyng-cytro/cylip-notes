CREATE TABLE `label_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`show_preview` integer DEFAULT true NOT NULL,
	`background_type` text,
	`background_value` text
);
--> statement-breakpoint
ALTER TABLE `labels` ADD `settings_id` text REFERENCES label_settings(id);