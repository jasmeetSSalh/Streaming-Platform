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
	const items = await db
		.select({
			id: titles.id,
			name: titles.name,
			genre: titles.genre,
			posterUrl: titles.posterUrl,
			type: titles.type,
			releaseYear: titles.releaseYear,
			savedAt: watchlistItems.createdAt,
		})
		.from(watchlistItems)
		.innerJoin(titles, eq(watchlistItems.titleId, titles.id))
		.where(eq(watchlistItems.userId, user.id))
		.orderBy(desc(watchlistItems.createdAt));

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">WATCHLIST</p>
			<h1 className="mt-2 text-3xl font-bold">Saved to watch later</h1>
			<p className="mt-2 text-slate-600">
				{items.length} {items.length === 1 ? "title" : "titles"} saved, most recent first.
			</p>

			{items.length === 0 ? (
				<p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
					Your watchlist is empty.{" "}
					<Link className="font-semibold text-violet-700 hover:underline" href="/catalog">
						Browse the catalog
					</Link>{" "}
					and add titles you want to watch later.
				</p>
			) : (
				<ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{items.map((item) => (
						<li className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white" key={item.id}>
							<Link className="group block" href={`/catalog/${item.id}`}>
								<TitlePoster name={item.name} posterUrl={item.posterUrl} />
								<div className="p-5 pb-3">
									<h2 className="text-lg font-semibold text-slate-950 group-hover:text-violet-700">{item.name}</h2>
									<p className="mt-1 text-sm text-slate-600">
										{item.genre} · {item.type === "MOVIE" ? "Movie" : "Show"} · {item.releaseYear}
									</p>
								</div>
							</Link>
							<div className="mt-auto px-5 pb-5">
								<WatchlistButton compact initialSaved titleId={item.id} titleName={item.name} />
							</div>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
