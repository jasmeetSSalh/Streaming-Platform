import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { syncStripeSubscription } from "@/lib/stripe-subscriptions";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to manage your subscription." }, { status: 401 });
  }

  const [subscription] = await db
    .select({
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "ACTIVE")))
    .orderBy(desc(subscriptions.startedAt))
    .limit(1);

  if (!subscription) {
    return NextResponse.json({ error: "No active subscription was found." }, { status: 404 });
  }
  if (!subscription.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "This plan cannot be renewed from Stripe." },
      { status: 400 },
    );
  }
  if (!subscription.cancelAtPeriodEnd) {
    return NextResponse.json({ error: "This subscription is not scheduled to cancel." }, { status: 409 });
  }

  try {
    const updatedSubscription = await getStripe().subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false },
    );
    await syncStripeSubscription(updatedSubscription);
    return NextResponse.json({ cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end });
  } catch (error) {
    console.error("Unable to keep Stripe subscription active.", error);
    return NextResponse.json(
      { error: "Unable to keep your subscription active. Please try again." },
      { status: 502 },
    );
  }
}
