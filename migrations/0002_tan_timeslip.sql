CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_email_idx` ON `invitation` (`email`);