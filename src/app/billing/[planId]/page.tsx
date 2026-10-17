import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans as plansTable, subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { syncStripeSubscription } from "@/lib/stripe-subscriptions";
import { BillingAuthDialog } from "./billing-auth-dialog";
import { CheckoutButton } from "./checkout-button";
import { SubscriptionPending } from "./subscription-pending";

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

function formatPrice(monthlyPrice: number) {
	return monthlyPrice === 0 ? "$0.00" : `$${monthlyPrice.toFixed(2)}`;
}

export default async function BillingPage({
	params,
	searchParams,
}: {
	params: Promise<{ planId: string }>;
	searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
	const [{ planId }, { checkout, session_id: checkoutSessionId }] = await Promise.all([
		params,
		searchParams,
	]);
	const [plan] = await db
		.select()
		.from(plansTable)
		.where(eq(plansTable.id, planId))
		.limit(1);

	if (!plan) {
		notFound();
	}

	const user = await getCurrentUser();
	const returnTo = `/billing/${encodeURIComponent(planId)}`;
	if (user && checkout === "success" && checkoutSessionId) {
		try {
			const checkoutSession = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
			const hasPaid = checkoutSession.payment_status === "paid" ||
				checkoutSession.payment_status === "no_payment_required";
			if (
				checkoutSession.mode === "subscription" &&
				checkoutSession.status === "complete" &&
				hasPaid &&
				checkoutSession.metadata?.userId === user.id &&
				checkoutSession.metadata?.planId === plan.id &&
				checkoutSession.subscription
			) {
				const subscriptionId =
					typeof checkoutSession.subscription === "string"
						? checkoutSession.subscription
						: checkoutSession.subscription.id;
				const stripeSubscription =
					typeof checkoutSession.subscription === "string"
						? await getStripe().subscriptions.retrieve(subscriptionId)
						: checkoutSession.subscription;
				await syncStripeSubscription(stripeSubscription);
			}
		} catch (error) {
			console.error("Unable to verify completed Stripe Checkout Session.", error);
		}
	}

	const [activeSubscription] = user
		? await db
				.select({ planId: subscriptions.planId })
				.from(subscriptions)
				.where(
					and(
						eq(subscriptions.userId, user.id),
						eq(subscriptions.status, "ACTIVE"),
					),
				)
				.orderBy(desc(subscriptions.startedAt))
				.limit(1)
		: [];
	const activePlanId = activeSubscription?.planId;
	const [subscribedPlan] = activePlanId && activePlanId !== plan.id
		? await db
				.select({ name: plansTable.name })
				.from(plansTable)
				.where(eq(plansTable.id, activePlanId))
				.limit(1)
		: [];

	return (
		<main className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
			{!user && <BillingAuthDialog returnTo={returnTo} />}
			<Link className="text-sm font-medium text-violet-700 hover:underline" href="/plans">
				&larr; Back to plans
			</Link>
			<p className="mt-8 text-sm font-semibold text-violet-700">BILLING</p>
			<h1 className="mt-2 text-3xl font-bold">Review your plan</h1>
			<p className="mt-2 text-slate-600">
				Confirm the plan details before continuing.
			</p>

			<section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-xl font-semibold">{formatPlanName(plan.name)} plan</h2>
						<p className="mt-2 text-slate-600">{plan.description}</p>
						<p className="mt-4 text-sm font-medium text-slate-800">
							{formatPlanName(plan.accessLevel)} content access
						</p>
					</div>
					<p className="shrink-0 text-2xl font-bold">
						{formatPrice(plan.monthlyPrice)}
						<span className="block text-right text-sm font-normal text-slate-500">/month</span>
					</p>
				</div>
				<div className="mt-6 border-t border-slate-200 pt-4">
					<div className="flex justify-between text-sm text-slate-600">
						<span>Monthly total</span>
						<span>{formatPrice(plan.monthlyPrice)}</span>
					</div>
				</div>
			</section>

			{activeSubscription ? (
				<aside
					className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900"
					role="status"
				>
					{activePlanId === plan.id
						? "This plan is active on your account."
						: `You already have an active ${subscribedPlan?.name.toLowerCase() ?? ""} subscription. Manage it from your account before choosing another plan.`}
					{" "}
					<Link className="font-medium underline" href="/dashboard">
						Go to your account
					</Link>
				</aside>
			) : checkout === "success" && user ? (
				<SubscriptionPending />
			) : checkout === "cancelled" ? (
				<>
					<aside className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
						Checkout was cancelled. You can continue whenever you’re ready.
					</aside>
					{user && <CheckoutButton isFree={plan.monthlyPrice === 0} planId={plan.id} />}
				</>
			) : user ? (
				<CheckoutButton isFree={plan.monthlyPrice === 0} planId={plan.id} />
			) : (
				<aside className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
					Payment is processed securely by Stripe in test mode. No real charges are made.
				</aside>
			)}
		</main>
	);
}
