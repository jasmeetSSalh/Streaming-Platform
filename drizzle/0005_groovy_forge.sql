DELETE FROM `title_views`
WHERE EXISTS (
	SELECT 1
	FROM `title_views` AS newer
	WHERE newer.`user_id` = `title_views`.`user_id`
		AND newer.`title_id` = `title_views`.`title_id`
		AND (
			newer.`viewed_at` > `title_views`.`viewed_at`
			OR (newer.`viewed_at` = `title_views`.`viewed_at` AND newer.`id` > `title_views`.`id`)
		)
);--> statement-breakpoint
CREATE UNIQUE INDEX `title_views_user_title_idx` ON `title_views` (`user_id`,`title_id`);