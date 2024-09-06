DROP INDEX IF EXISTS `github_id_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `feide_id_idx` ON `user` (`feide_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `github_id_idx` ON `user` (`github_id`);