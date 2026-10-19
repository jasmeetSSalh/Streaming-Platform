import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans, subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in before continuing to checkout." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "A valid planId is required." }, { status: 400 });
    }
    throw error;
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("planId" in body) ||
    typeof body.planId !== "string" ||
    !body.planId.trim()
  ) {
    return NextResponse.json({ error: "A valid planId is required." }, { status: 400 });
  }

  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, body.planId.trim()))
    .limit(1);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  }

  const [activeSubscription] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "ACTIVE")))
    .limit(1);
  if (activeSubscription) {
    return NextResponse.json(
      { error: "You already have an active subscription." },
      { status: 409 },
    );
  }

  let appUrl: string;
  try {
    appUrl = getAppUrl();
  } catch (error) {
    console.error("Checkout app URL is not configured correctly.", error);
    return NextResponse.json(
      { error: "Checkout is not configured. Set APP_URL to the app's public URL." },
      { status: 503 },
    );
  }
  const billingUrl = `${appUrl}/billing/${encodeURIComponent(plan.id)}`;

  if (!Number.isFinite(plan.monthlyPrice) || plan.monthlyPrice < 0) {
    console.error(`Plan ${plan.id} has an invalid monthly price.`);
    return NextResponse.json({ error: "This plan is not available for checkout." }, { status: 500 });
  }

  if (plan.monthlyPrice === 0) {
    const startedAt = new Date();
    await db.insert(subscriptions).values({
      id: randomUUID(),
      userId: user.id,
      planId: plan.id,
      status: "ACTIVE",
      startedAt,
    });
    return NextResponse.json({ url: `${billingUrl}?checkout=free` });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe checkout is not configured. Set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name.charAt(0)}${plan.name.slice(1).toLowerCase()} plan`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.monthlyPrice * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id, planId: plan.id },
      subscription_data: { metadata: { userId: user.id, planId: plan.id } },
      success_url: `${billingUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingUrl}?checkout=cancelled`,
    });

    if (!session.url) {
      console.error("Stripe created a Checkout Session without a redirect URL.");
      return NextResponse.json(
        { error: "Stripe could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Unable to create Stripe Checkout Session.", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 502 },
    );
  }
}
