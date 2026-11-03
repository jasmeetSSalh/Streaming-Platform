import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { plans, subscriptionPlanChanges, subscriptions, titleViews, titles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { HistoryTimestamp } from "./history-timestamp";

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

export default async function HistoryPage() {
	const user = await requireUser();
	const [subscriptionRecords, planChanges, viewedTitles, planNames] = await Promise.all([
		db
			.select({
				id: subscriptions.id,
				planName: plans.name,
				status: subscriptions.status,
				date: subscriptions.startedAt,
			})
			.from(subscriptions)
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.where(eq(subscriptions.userId, user.id))
			.orderBy(desc(subscriptions.startedAt)),
		db
			.select({
				id: subscriptionPlanChanges.id,
				subscriptionId: subscriptionPlanChanges.subscriptionId,
				fromPlanId: subscriptionPlanChanges.fromPlanId,
				toPlanId: subscriptionPlanChanges.toPlanId,
				date: subscriptionPlanChanges.changedAt,
			})
			.from(subscriptionPlanChanges)
			.where(eq(subscriptionPlanChanges.userId, user.id))
			.orderBy(desc(subscriptionPlanChanges.changedAt)),
		db
			.select({
				id: titleViews.id,
				titleId: titles.id,
				titleName: titles.name,
				date: titleViews.viewedAt,
			})
			.from(titleViews)
			.innerJoin(titles, eq(titleViews.titleId, titles.id))
			.where(eq(titleViews.userId, user.id))
			.orderBy(desc(titleViews.viewedAt)),
		db.select({ id: plans.id, name: plans.name }).from(plans),
	]);

	const planNameById = new Map(planNames.map((plan) => [plan.id, plan.name]));
	const originalPlanBySubscriptionId = new Map<string, string>();
	for (const change of [...planChanges].sort((a, b) => a.date.getTime() - b.date.getTime())) {
		if (!originalPlanBySubscriptionId.has(change.subscriptionId)) {
			originalPlanBySubscriptionId.set(change.subscriptionId, change.fromPlanId);
		}
	}

	const history = [
		...subscriptionRecords.map((item) => ({
			id: item.id,
			planName: planNameById.get(originalPlanBySubscriptionId.get(item.id) ?? "") ?? item.planName,
			status: item.status,
			date: item.date,
			type: "plan_start" as const,
		})),
		...planChanges.map((item) => ({
			...item,
			fromPlanName: planNameById.get(item.fromPlanId) ?? "Unknown",
			toPlanName: planNameById.get(item.toPlanId) ?? "Unknown",
			type: "plan_change" as const,
		})),
		...viewedTitles.map((item) => ({ ...item, type: "view" as const })),
	].sort((a, b) => b.date.getTime() - a.date.getTime());

	return (
		<main className="mx-auto min-h-[calc(100vh-65px)] max-w-4xl px-6 py-10 sm:px-10 sm:py-14">
			<p className="text-sm font-semibold tracking-[0.14em] text-violet-700 uppercase">Your account</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">History</h1>
			<p className="mt-2 text-slate-600">Your recent title views and subscription plans.</p>

			{history.length === 0 ? (
				<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
					<h2 className="text-lg font-semibold text-slate-950">Nothing here yet</h2>
					<p className="mt-2 text-sm text-slate-600">Browse the catalog or choose a plan to start your history.</p>
					<div className="mt-5 flex justify-center gap-3">
						<Link className="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800" href="/catalog">
							Browse catalog
						</Link>
						<Link className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/plans">
							View plans
						</Link>
					</div>
				</section>
			) : (
				<ol className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					{history.map((item) => (
						<li className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8" key={`${item.type}-${item.id}`}>
							<div>
								<p className="font-semibold text-slate-950">
									{item.type === "plan_start" ? (
										<>Started {formatPlanName(item.planName)} plan</>
									) : item.type === "plan_change" ? (
										<>Changed plan from {formatPlanName(item.fromPlanName)} to {formatPlanName(item.toPlanName)}</>
									) : (
										<>
											Viewed{" "}
											<Link className="text-violet-700 hover:underline" href={`/catalog/${item.titleId}`}>
												{item.titleName}
											</Link>
										</>
									)}
								</p>
								<HistoryTimestamp date={item.date} />
							</div>
							{item.type === "plan_start" && (
								<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
									{item.status.toLowerCase()}
								</span>
							)}
						</li>
					))}
				</ol>
			)}
		</main>
	);
}
