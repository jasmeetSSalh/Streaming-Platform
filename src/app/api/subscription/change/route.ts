import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { plans, subscriptionPlanChanges, subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { syncStripeSubscription } from "@/lib/stripe-subscriptions";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

async function getStripePlanProduct(plan: typeof plans.$inferSelect) {
	const stripe = getStripe();
	for await (const product of stripe.products.list({ active: true, limit: 100 })) {
		if (product.metadata.streamlyPlanId === plan.id) return product;
	}

	return stripe.products.create({
		name: `${plan.name.charAt(0)}${plan.name.slice(1).toLowerCase()} plan`,
		description: plan.description,
		metadata: { streamlyPlanId: plan.id },
	});
}

async function getStripePlanPrice(plan: typeof plans.$inferSelect) {
	const stripe = getStripe();
	const product = await getStripePlanProduct(plan);
	const unitAmount = Math.round(plan.monthlyPrice * 100);

	for await (const price of stripe.prices.list({ active: true, product: product.id, limit: 100 })) {
		if (
			price.currency === "usd" &&
			price.unit_amount === unitAmount &&
			price.recurring?.interval === "month" &&
			price.recurring.interval_count === 1
		) {
			return price;
		}
	}

	return stripe.prices.create({
		currency: "usd",
		product: product.id,
		unit_amount: unitAmount,
		recurring: { interval: "month" },
		metadata: { streamlyPlanId: plan.id },
	});
}

export async function POST(request: Request) {
	const user = await getCurrentUser();
	if (!user) {
		return NextResponse.json({ error: "Sign in to change your plan." }, { status: 401 });
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

	if (!isRecord(body) || typeof body.planId !== "string" || !body.planId.trim()) {
		return NextResponse.json({ error: "A valid planId is required." }, { status: 400 });
	}

	const [targetPlan] = await db.select().from(plans).where(eq(plans.id, body.planId.trim())).limit(1);
	if (!targetPlan) {
		return NextResponse.json({ error: "Plan not found." }, { status: 404 });
	}
	if (!Number.isFinite(targetPlan.monthlyPrice) || targetPlan.monthlyPrice < 0) {
		console.error(`Plan ${targetPlan.id} has an invalid monthly price.`);
		return NextResponse.json({ error: "This plan is not available." }, { status: 500 });
	}

	const [current] = await db
		.select({
			id: subscriptions.id,
			planId: subscriptions.planId,
			stripeSubscriptionId: subscriptions.stripeSubscriptionId,
		})
		.from(subscriptions)
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "ACTIVE")))
		.orderBy(desc(subscriptions.startedAt))
		.limit(1);

	if (!current) {
		return NextResponse.json({ error: "No active plan was found. Choose a plan to get started." }, { status: 404 });
	}
	if (current.planId === targetPlan.id) {
		return NextResponse.json({ error: "This plan is already active." }, { status: 409 });
	}

	const changedAt = new Date();
	if (!current.stripeSubscriptionId) {
		if (targetPlan.monthlyPrice > 0) {
			return NextResponse.json({ error: "Continue to checkout to start a paid plan." }, { status: 409 });
		}

		try {
			await db.transaction(async (tx) => {
				await tx.update(subscriptions).set({ planId: targetPlan.id }).where(eq(subscriptions.id, current.id));
				await tx.insert(subscriptionPlanChanges).values({
					id: randomUUID(),
					subscriptionId: current.id,
					userId: user.id,
					fromPlanId: current.planId,
					toPlanId: targetPlan.id,
					changedAt,
				});
			});
		} catch (error) {
			console.error("Unable to save the free plan change.", error);
			return NextResponse.json({ error: "Unable to update your plan. Please try again." }, { status: 500 });
		}

		return NextResponse.json({
			planName: targetPlan.name,
			accessLevel: targetPlan.accessLevel,
			changedAt: changedAt.toISOString(),
		});
	}

	if (!process.env.STRIPE_SECRET_KEY) {
		return NextResponse.json({ error: "Subscription changes are not configured." }, { status: 503 });
	}

	let updatedSubscription: Stripe.Subscription;
	try {
		const stripe = getStripe();
		const stripeSubscription = await stripe.subscriptions.retrieve(current.stripeSubscriptionId);
		if (!["active", "trialing"].includes(stripeSubscription.status)) {
			return NextResponse.json({ error: "This subscription can no longer be changed." }, { status: 409 });
		}

		const subscriptionItem = stripeSubscription.items.data[0];
		if (!subscriptionItem) {
			console.error(`Stripe subscription ${stripeSubscription.id} has no subscription items.`);
			return NextResponse.json({ error: "Unable to identify the active subscription plan." }, { status: 502 });
		}

		const price = await getStripePlanPrice(targetPlan);
		updatedSubscription = await stripe.subscriptions.update(stripeSubscription.id, {
			items: [{ id: subscriptionItem.id, price: price.id }],
			proration_behavior: "always_invoice",
			payment_behavior: "error_if_incomplete",
			cancel_at_period_end: false,
			metadata: {
				...stripeSubscription.metadata,
				userId: user.id,
				planId: targetPlan.id,
			},
		});
	} catch (error) {
		console.error("Unable to apply subscription plan change in Stripe.", error);
		if (error instanceof Stripe.errors.StripeCardError) {
			return NextResponse.json(
				{ error: "Payment could not be completed, so your current plan remains active." },
				{ status: 402 },
			);
		}
		return NextResponse.json(
			{ error: "Unable to confirm the plan change. Refresh your account before trying again." },
			{ status: 502 },
		);
	}

	try {
		await syncStripeSubscription(updatedSubscription);
		await db.insert(subscriptionPlanChanges).values({
			id: randomUUID(),
			subscriptionId: current.id,
			userId: user.id,
			fromPlanId: current.planId,
			toPlanId: targetPlan.id,
			changedAt,
		});
	} catch (error) {
		console.error("Stripe changed the plan, but local subscription history could not be synchronized.", error);
		return NextResponse.json(
			{ error: "Your plan changed, but account history could not be refreshed. Reload your account shortly." },
			{ status: 500 },
		);
	}

	return NextResponse.json({
		planName: targetPlan.name,
		accessLevel: targetPlan.accessLevel,
		changedAt: changedAt.toISOString(),
	});
}
