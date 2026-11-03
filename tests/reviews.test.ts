import assert from "node:assert/strict";
import test from "node:test";
import { parseReviewInput } from "../src/lib/reviews";

function form(entries: Record<string, string>) {
	const data = new FormData();
	for (const [key, value] of Object.entries(entries)) data.set(key, value);
	return data;
}

test("review ratings must be whole numbers from 1 to 5", () => {
	assert.deepEqual(parseReviewInput(form({ rating: "5", body: "Great" })), { data: { rating: 5, body: "Great" } });
	for (const rating of ["0", "6", "3.5", ""]) {
		const parsed = parseReviewInput(form({ rating }));
		assert.ok("error" in parsed);
		assert.equal(parsed.error, "Choose a rating from 1 to 5 stars.");
	}
});

test("review text is optional and empty bodies are stored as null", () => {
	assert.deepEqual(parseReviewInput(form({ rating: "4", body: "   " })), { data: { rating: 4, body: null } });
});
