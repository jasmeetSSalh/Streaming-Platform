import { count } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { reviews, titles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { topByRatingCount, topByViewCount, type AnalyticsTitle } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function AnalyticsList({
	empty,
	items,
	valueLabel,
	valueOf,
}: {
	empty: string;
	items: AnalyticsTitle[];
	valueLabel: string;
	valueOf: (item: AnalyticsTitle) => number;
}) {
	if (items.length === 0) {
		return <p className="mt-4 text-slate-600">{empty}</p>;
	}

	return (
		<ol className="mt-4 grid gap-3">
			{items.map((item, index) => (
				<li className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3" key={item.id}>
					<div className="min-w-0">
						<p className="font-semibold text-slate-950">
							{index + 1}. {item.name}
						</p>
						<p className="mt-1 text-sm text-slate-600">{item.genre}</p>
					</div>
					<p className="shrink-0 text-sm font-medium text-violet-700">
						{valueOf(item)} {valueOf(item) === 1 ? valueLabel.replace(/s$/, "") : valueLabel}
					</p>
				</li>
			))}
		</ol>
	);
}

export default async function AdminAnalyticsPage() {
	await requireAdmin();
	const titleRows = await db.select({ id: titles.id, name: titles.name, genre: titles.genre, viewCount: titles.viewCount }).from(titles);
	const ratingRows = await db
		.select({ titleId: reviews.titleId, ratingCount: count(reviews.id) })
		.from(reviews)
		.groupBy(reviews.titleId);
	const ratingCountByTitle = new Map(ratingRows.map((row) => [row.titleId, Number(row.ratingCount)]));
	const catalog: AnalyticsTitle[] = titleRows.map((row) => ({
		id: row.id,
		name: row.name,
		genre: row.genre,
		viewCount: row.viewCount,
		ratingCount: ratingCountByTitle.get(row.id) ?? 0,
	}));

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<Link className="text-sm font-semibold text-violet-700 hover:underline" href="/admin">
				<span aria-hidden="true">← </span>Catalog management
			</Link>
			<p className="mt-6 text-sm font-semibold text-violet-700">ADMIN</p>
			<h1 className="mt-2 text-3xl font-bold">Catalog analytics</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Top titles by how often they are rated and how often their detail pages are viewed. Counts refresh each time this page loads.
			</p>

			<div className="mt-10 grid gap-10 lg:grid-cols-2">
				<section>
					<h2 className="text-xl font-semibold text-slate-950">Most rated</h2>
					<AnalyticsList
						empty="No ratings yet."
						items={topByRatingCount(catalog)}
						valueLabel="ratings"
						valueOf={(item) => item.ratingCount}
					/>
				</section>
				<section>
					<h2 className="text-xl font-semibold text-slate-950">Most viewed</h2>
					<AnalyticsList
						empty="No title views yet."
						items={topByViewCount(catalog)}
						valueLabel="views"
						valueOf={(item) => item.viewCount}
					/>
				</section>
			</div>
		</main>
	);
}
