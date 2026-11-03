import assert from "node:assert/strict";
import test from "node:test";
import { hasPlanAccess } from "../src/lib/plan-access";

test("plan access allows content at or below the current tier", () => {
	assert.equal(hasPlanAccess("FREE", "FREE"), true);
	assert.equal(hasPlanAccess("BASIC", "FREE"), true);
	assert.equal(hasPlanAccess("BASIC", "BASIC"), true);
	assert.equal(hasPlanAccess("PREMIUM", "BASIC"), true);
	assert.equal(hasPlanAccess("PREMIUM", "PREMIUM"), true);
});

test("downgrading immediately denies content above the new tier", () => {
	assert.equal(hasPlanAccess("FREE", "BASIC"), false);
	assert.equal(hasPlanAccess("BASIC", "PREMIUM"), false);
});
