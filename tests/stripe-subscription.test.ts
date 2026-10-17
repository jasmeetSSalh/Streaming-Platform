import assert from "node:assert/strict";
import test from "node:test";
import { mapStripeSubscriptionStatus } from "../src/lib/stripe-subscriptions";

test("Stripe active and trialing subscriptions grant app access", () => {
  assert.equal(mapStripeSubscriptionStatus("active"), "ACTIVE");
  assert.equal(mapStripeSubscriptionStatus("trialing"), "ACTIVE");
});

test("Stripe cancellation and non-active states do not grant app access", () => {
  assert.equal(mapStripeSubscriptionStatus("canceled"), "CANCELLED");
  assert.equal(mapStripeSubscriptionStatus("past_due"), "EXPIRED");
  assert.equal(mapStripeSubscriptionStatus("incomplete"), "EXPIRED");
});
