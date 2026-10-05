import { desc } from "drizzle-orm";
import { db } from "@/db";
import { titles } from "@/db/schema";
import { TitlePoster } from "@/components/title-poster";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
	const catalog = await db.select().from(titles).orderBy(desc(titles.createdAt));

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">CATALOG</p>
			<h1 className="mt-2 text-3xl font-bold">Discover something to watch</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Browse every movie and show currently in the catalog.
			</p>

			{catalog.length === 0 ? (
				<p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
					No titles yet. An admin can add movies and shows from the catalog management page.
				</p>
			) : (
				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{catalog.map((title) => (
						<article className="overflow-hidden rounded-xl border border-slate-200 bg-white" key={title.id}>
							<TitlePoster name={title.name} posterUrl={title.posterUrl} />
							<div className="p-5">
								<h2 className="text-lg font-semibold text-slate-950">{title.name}</h2>
								<p className="mt-1 text-sm text-slate-600">{title.genre}</p>
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
