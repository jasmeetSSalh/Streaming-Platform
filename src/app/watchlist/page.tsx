import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { TitlePoster } from "@/components/title-poster";
import { WatchlistButton } from "@/components/watchlist-button";
import { db } from "@/db";
import { titles, watchlistItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
	const user = await requireUser();
	const savedTitles = await db
		.select({
			id: titles.id,
			name: titles.name,
			genre: titles.genre,
			posterUrl: titles.posterUrl,
			addedAt: watchlistItems.createdAt,
		})
		.from(watchlistItems)
		.innerJoin(titles, eq(watchlistItems.titleId, titles.id))
		.where(eq(watchlistItems.userId, user.id))
		.orderBy(desc(watchlistItems.createdAt));

	return (
		<main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
			<p className="text-sm font-semibold tracking-[0.14em] text-violet-700 uppercase">Your list</p>
			<div className="mt-2 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-slate-950">Watchlist</h1>
					<p className="mt-2 text-slate-600">Titles you want to watch next.</p>
				</div>
				<Link
					className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
					href="/catalog"
				>
					Browse catalog
				</Link>
			</div>

			{savedTitles.length === 0 ? (
				<section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
					<h2 className="text-xl font-semibold text-slate-950">Your watchlist is empty</h2>
					<p className="mt-2 text-sm text-slate-600">Save titles from the catalog to keep track of what you want to watch.</p>
					<div className="mt-5 flex justify-center">
						<Link
							className="inline-flex rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
							href="/catalog"
						>
							Browse catalog
						</Link>
					</div>
				</section>
			) : (
				<ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{savedTitles.map((title) => (
						<li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={title.id}>
							<Link className="group block" href={`/catalog/${title.id}`}>
								<TitlePoster className="rounded-xl" name={title.name} posterUrl={title.posterUrl} />
								<p className="mt-3 truncate text-base font-semibold text-slate-950 group-hover:text-violet-700">
									{title.name}
								</p>
								<p className="text-sm text-slate-500">{title.genre}</p>
							</Link>
							<div className="mt-4">
								<WatchlistButton titleId={title.id} saved={true} />
							</div>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
