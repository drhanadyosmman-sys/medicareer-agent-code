ALTER TABLE `users` ADD `loginTokenHash` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `loginTokenExpiresAt` timestamp;