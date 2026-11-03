CREATE TABLE `subscription_plan_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`user_id` text NOT NULL,
	`from_plan_id` text NOT NULL,
	`to_plan_id` text NOT NULL,
	`changed_at` integer NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subscription_plan_changes_user_changed_at_idx` ON `subscription_plan_changes` (`user_id`,`changed_at`);--> statement-breakpoint
CREATE INDEX `subscription_plan_changes_subscription_idx` ON `subscription_plan_changes` (`subscription_id`);