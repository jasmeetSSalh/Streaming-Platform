import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { TitlePoster } from "@/components/title-poster";
import { db } from "@/db";
import { plans, subscriptions, titles, watchlistItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { describeRenewal, WATCHLIST_PREVIEW_LIMIT } from "@/lib/dashboard";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { KeepSubscriptionButton } from "./keep-subscription-button";

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

function formatPrice(monthlyPrice: number) {
	return monthlyPrice === 0 ? "$0.00" : `$${monthlyPrice.toFixed(2)}`;
}

function formatDate(date: Date) {
	return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function DashboardPage() {
	const user = await requireUser();
	const [activeSubscription] = await db
		.select({
			planName: plans.name,
			monthlyPrice: plans.monthlyPrice,
			startedAt: subscriptions.startedAt,
			stripeSubscriptionId: subscriptions.stripeSubscriptionId,
			cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
			currentPeriodEnd: subscriptions.currentPeriodEnd,
		})
		.from(subscriptions)
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "ACTIVE")))
		.orderBy(desc(subscriptions.startedAt))
		.limit(1);
	const watchlistPreview = await db
		.select({ id: titles.id, name: titles.name, genre: titles.genre, posterUrl: titles.posterUrl })
		.from(watchlistItems)
		.innerJoin(titles, eq(watchlistItems.titleId, titles.id))
		.where(eq(watchlistItems.userId, user.id))
		.orderBy(desc(watchlistItems.createdAt))
		.limit(WATCHLIST_PREVIEW_LIMIT);
	const [{ watchlistCount }] = await db
		.select({ watchlistCount: count() })
		.from(watchlistItems)
		.where(eq(watchlistItems.userId, user.id));
	const renewal = describeRenewal(activeSubscription);

	return (
		<main className="min-h-[calc(100vh-65px)] bg-slate-50">
			<div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
				<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
					<div aria-hidden="true" className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[36px] border-white/5" />
					<div aria-hidden="true" className="absolute -bottom-36 right-32 h-72 w-72 rounded-full border-[36px] border-white/5" />
					<div className="relative flex flex-wrap items-end justify-between gap-6">
						<div>
							<p className="text-sm font-semibold tracking-[0.16em] text-violet-200 uppercase">
								Your Streamly account
							</p>
							<h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								Welcome back, {user.name}
							</h1>
							<p className="mt-2 text-violet-100">
								Your next favorite is waiting.
							</p>
						</div>
						<Link
							className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-violet-950 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
							href="/catalog"
						>
							Browse catalog
							<span aria-hidden="true">→</span>
						</Link>
					</div>
				</section>

				<div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">
					<section
						aria-labelledby="current-plan-title"
						className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
					>
						<div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
							<div>
								<p className="text-xs font-bold tracking-[0.14em] text-violet-700 uppercase">
									Subscription
								</p>
								<h2 className="mt-1 text-xl font-semibold text-slate-950" id="current-plan-title">
									Your plan
								</h2>
							</div>
							{activeSubscription && (
								<span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
									<span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
									Active
								</span>
							)}
						</div>

						{activeSubscription ? (
							<div className="px-6 py-7 sm:px-8 sm:py-8">
								<div className="flex flex-wrap items-end justify-between gap-5">
									<div>
										<p className="text-3xl font-bold tracking-tight text-slate-950">
											{formatPlanName(activeSubscription.planName)}
										</p>
										<p className="mt-2 text-sm text-slate-600">
											Enjoy your movies and shows with this plan.
										</p>
									</div>
									<p className="text-2xl font-bold text-slate-950">
										{formatPrice(activeSubscription.monthlyPrice)}
										<span className="text-sm font-normal text-slate-500"> / month</span>
									</p>
								</div>
								<div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
									<svg aria-hidden="true" className="h-5 w-5 shrink-0 text-violet-700" fill="none" viewBox="0 0 24 24">
										<rect height="17" rx="2" stroke="currentColor" strokeWidth="1.7" width="18" x="3" y="4" />
										<path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
									</svg>
									<span>
										Member since{" "}
										<time className="font-medium text-slate-800" dateTime={activeSubscription.startedAt.toISOString()}>
											{formatDate(activeSubscription.startedAt)}
										</time>
									</span>
									<span aria-hidden="true" className="text-slate-300">·</span>
									<span>
										{renewal.label}
										{renewal.date && (
											<>
												{" "}
												<time className="font-medium text-slate-800" dateTime={renewal.date.toISOString()}>
													{formatDate(renewal.date)}
												</time>
											</>
										)}
									</span>
								</div>
								{activeSubscription.cancelAtPeriodEnd ? (
									<div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
										<p className="text-sm text-amber-900">
											Cancellation scheduled
											{activeSubscription.currentPeriodEnd && (
												<>
													. Your access continues until{" "}
													<time className="font-semibold" dateTime={activeSubscription.currentPeriodEnd.toISOString()}>
														{activeSubscription.currentPeriodEnd.toLocaleDateString(undefined, {
															year: "numeric",
															month: "long",
															day: "numeric",
														})}
													</time>
												</>
											)}
											.
										</p>
										<div className="mt-3">
											<KeepSubscriptionButton />
										</div>
									</div>
								) : activeSubscription.stripeSubscriptionId ? (
									<div className="mt-5 border-t border-slate-100 pt-4">
										<CancelSubscriptionButton />
									</div>
								) : null}
							</div>
						) : (
							<div className="px-6 py-8 sm:px-8">
								<p className="text-lg font-semibold text-slate-900">
									Your viewing journey starts here
								</p>
								<p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
									Choose a plan to unlock a great selection of movies and shows.
								</p>
								<Link
									className="mt-5 inline-flex rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
									href="/plans"
								>
									Explore plans
								</Link>
							</div>
						)}
					</section>

					<aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-bold tracking-[0.14em] text-violet-700 uppercase">
							Account details
						</p>
						<div className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-800">
							{user.name.slice(0, 1).toUpperCase()}
						</div>
						<p className="mt-4 font-semibold text-slate-950">{user.name}</p>
						<p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
						<Link
							className="mt-5 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-900 hover:underline"
							href="/profile"
						>
							Edit profile
							<span aria-hidden="true" className="ml-1">→</span>
						</Link>
					</aside>
				</div>

				<section
					aria-labelledby="watchlist-title"
					className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
				>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="text-xs font-bold tracking-[0.14em] text-violet-700 uppercase">
								Watchlist
							</p>
							<h2 className="mt-1 text-xl font-semibold text-slate-950" id="watchlist-title">
								Saved to watch later
								<span className="ml-2 text-sm font-normal text-slate-500">({watchlistCount})</span>
							</h2>
						</div>
						<Link
							className="text-sm font-semibold text-violet-700 hover:text-violet-900 hover:underline"
							href="/watchlist"
						>
							View full watchlist
							<span aria-hidden="true" className="ml-1">→</span>
						</Link>
					</div>
					{watchlistPreview.length > 0 ? (
						<ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{watchlistPreview.map((title) => (
								<li key={title.id}>
									<Link className="group block" href={`/catalog/${title.id}`}>
										<TitlePoster className="rounded-lg" name={title.name} posterUrl={title.posterUrl} />
										<p className="mt-2 truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700">
											{title.name}
										</p>
										<p className="text-xs text-slate-500">{title.genre}</p>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-sm text-slate-600">
							Nothing saved yet.{" "}
							<Link className="font-semibold text-violet-700 hover:underline" href="/catalog">
								Browse the catalog
							</Link>{" "}
							to find something to watch.
						</p>
					)}
				</section>
			</div>
		</main>
	);
}
