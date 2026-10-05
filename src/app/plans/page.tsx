import { db } from "@/db";
import { plans as plansTable } from "@/db/schema";
import Link from "next/link";

const accessLevelOrder: Record<typeof plansTable.$inferSelect.accessLevel, number> = {
	FREE: 0,
	BASIC: 1,
	PREMIUM: 2,
};

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

function formatPrice(monthlyPrice: number) {
	return monthlyPrice === 0 ? "$0" : `$${monthlyPrice.toFixed(2)}`;
}

export default async function PlansPage() {
	const plans = await db.select().from(plansTable);
	plans.sort((first, second) => accessLevelOrder[first.accessLevel] - accessLevelOrder[second.accessLevel]);

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">SUBSCRIPTIONS</p>
			<h1 className="mt-2 text-3xl font-bold">Our plans</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Compare monthly pricing and content access for each plan.
			</p>

			{plans.length > 0 ? (
				<div className="mt-8 grid gap-5 md:grid-cols-3">
					{plans.map((plan) => (
						<article
							className={`rounded-xl bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
								plan.accessLevel === "PREMIUM"
									? "border-2 border-amber-400 shadow-md hover:border-amber-500"
									: "border border-slate-200 hover:border-violet-300"
							}`}
							key={plan.id}
						>
							<div className="flex items-center gap-2">
								{plan.accessLevel === "PREMIUM" && (
									<svg
										aria-hidden="true"
										className="h-6 w-6 text-amber-500"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="m3 19 1.5-9 5.25 4.5L12 6l2.25 8.5L19.5 10 21 19H3Zm1.5 2h15v-1.5h-15V21Z" />
									</svg>
								)}
								<h2 className="text-xl font-semibold">{formatPlanName(plan.name)}</h2>
							</div>
							<p className="mt-3 text-3xl font-bold">
								{formatPrice(plan.monthlyPrice)}
								<span className="text-sm font-normal text-slate-500">/month</span>
							</p>
							<p className="mt-4 font-medium text-slate-800">
								{formatPlanName(plan.accessLevel)} content access
							</p>
							<p className="mt-2 text-slate-600">{plan.description}</p>
							<Link
								className="mt-6 inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-800 active:scale-95"
								href={`/billing/${plan.id}`}
							>
								Select plan
							</Link>
						</article>
					))}
				</div>
			) : (
				<p className="mt-8 text-slate-600">No plans are available yet.</p>
			)}
		</main>
	);
}
