import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans as plansTable } from "@/db/schema";

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

function formatPrice(monthlyPrice: number) {
	return monthlyPrice === 0 ? "$0.00" : `$${monthlyPrice.toFixed(2)}`;
}

export default async function BillingPage({
	params,
}: {
	params: Promise<{ planId: string }>;
}) {
	const { planId } = await params;
	const [plan] = await db
		.select()
		.from(plansTable)
		.where(eq(plansTable.id, planId))
		.limit(1);

	if (!plan) {
		notFound();
	}

	return (
		<main className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
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

			<aside className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
				This is a preview only. Payment processing is not enabled, and no payment details
				will be collected or charged.
			</aside>
		</main>
	);
}
