import assert from "node:assert/strict";
import test from "node:test";
import { ANALYTICS_TOP_LIMIT, topByRatingCount, topByViewCount } from "../src/lib/analytics";

const catalog = [
	{ id: "a", name: "Alpha", genre: "Drama", ratingCount: 8, viewCount: 2 },
	{ id: "b", name: "Beta", genre: "Comedy", ratingCount: 3, viewCount: 40 },
	{ id: "c", name: "Gamma", genre: "Action", ratingCount: 0, viewCount: 0 },
	{ id: "d", name: "Delta", genre: "Mystery", ratingCount: 12, viewCount: 9 },
	{ id: "e", name: "Echo", genre: "Horror", ratingCount: 5, viewCount: 11 },
	{ id: "f", name: "Foxtrot", genre: "Family", ratingCount: 4, viewCount: 11 },
	{ id: "g", name: "Golf", genre: "Romance", ratingCount: 1, viewCount: 30 },
];

test("analytics keeps a top-5 list", () => {
	assert.equal(ANALYTICS_TOP_LIMIT, 5);
});

test("most-rated ranks by rating count and ignores unrated titles", () => {
	assert.deepEqual(
		topByRatingCount(catalog).map((row) => row.id),
		["d", "a", "e", "f", "b"],
	);
});

test("most-viewed ranks by view count and ignores unseen titles", () => {
	assert.deepEqual(
		topByViewCount(catalog).map((row) => row.id),
		["b", "g", "e", "f", "d"],
	);
});
