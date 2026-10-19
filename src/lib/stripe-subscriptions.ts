import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { plans, subscriptions, users } from "@/db/schema";

export type AppSubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): AppSubscriptionStatus {
  if (status === "active" || status === "trialing") {
    return "ACTIVE";
  }
  if (status === "canceled") {
    return "CANCELLED";
  }
  return "EXPIRED";
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const planId = subscription.metadata.planId;
  if (!userId || !planId) {
    throw new Error(`Stripe subscription ${subscription.id} is missing app metadata.`);
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  const [plan] = await db.select({ id: plans.id }).from(plans).where(eq(plans.id, planId)).limit(1);
  if (!user || !plan) {
    throw new Error(`Stripe subscription ${subscription.id} references an unknown user or plan.`);
  }

  await db
    .insert(subscriptions)
    .values({
      id: randomUUID(),
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      status: mapStripeSubscriptionStatus(subscription.status),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: getCurrentPeriodEnd(subscription),
      startedAt: new Date(subscription.created * 1000),
      endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
    })
    .onConflictDoUpdate({
      target: subscriptions.stripeSubscriptionId,
      set: {
        userId,
        planId,
        status: mapStripeSubscriptionStatus(subscription.status),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: getCurrentPeriodEnd(subscription),
        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      },
    });
}
