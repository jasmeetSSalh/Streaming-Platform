ALTER TABLE `subscriptions` ADD `stripe_subscription_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);