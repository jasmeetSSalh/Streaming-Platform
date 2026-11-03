export const ANALYTICS_TOP_LIMIT = 5;

export type AnalyticsTitle = {
	id: string;
	name: string;
	genre: string;
	ratingCount: number;
	viewCount: number;
};

export function topByRatingCount(rows: AnalyticsTitle[], limit = ANALYTICS_TOP_LIMIT) {
	return [...rows]
		.filter((row) => row.ratingCount > 0)
		.sort((a, b) => b.ratingCount - a.ratingCount || b.viewCount - a.viewCount || a.name.localeCompare(b.name))
		.slice(0, limit);
}

export function topByViewCount(rows: AnalyticsTitle[], limit = ANALYTICS_TOP_LIMIT) {
	return [...rows]
		.filter((row) => row.viewCount > 0)
		.sort((a, b) => b.viewCount - a.viewCount || b.ratingCount - a.ratingCount || a.name.localeCompare(b.name))
		.slice(0, limit);
}
