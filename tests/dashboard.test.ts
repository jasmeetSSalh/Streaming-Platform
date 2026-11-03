import assert from "node:assert/strict";
import test from "node:test";
import { describeRenewal, WATCHLIST_PREVIEW_LIMIT } from "../src/lib/dashboard";

const periodEnd = new Date("2026-11-24T00:00:00Z");

test("dashboard shows the renewal date for an active paid plan", () => {
  assert.deepEqual(describeRenewal({ stripeSubscriptionId: "sub_1", cancelAtPeriodEnd: false, currentPeriodEnd: periodEnd }), { label: "Renews on", date: periodEnd });
});

test("dashboard shows when access ends for a cancelled paid plan", () => {
  assert.deepEqual(describeRenewal({ stripeSubscriptionId: "sub_1", cancelAtPeriodEnd: true, currentPeriodEnd: periodEnd }), { label: "Access ends on", date: periodEnd });
});

test("dashboard status covers free plans, missing period dates, and no plan", () => {
  assert.equal(describeRenewal({ stripeSubscriptionId: null, cancelAtPeriodEnd: false, currentPeriodEnd: null }).label, "Free plan, no renewal needed");
  assert.equal(describeRenewal({ stripeSubscriptionId: "sub_1", cancelAtPeriodEnd: false, currentPeriodEnd: null }).label, "Renewal date pending");
  assert.equal(describeRenewal(undefined).label, "No active plan");
});

test("dashboard previews at most 5 watchlist items", () => {
  assert.equal(WATCHLIST_PREVIEW_LIMIT, 5);
});
