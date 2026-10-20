import { desc } from "drizzle-orm";
import { CatalogBrowser } from "@/components/catalog-browser";
import { db } from "@/db";
import { titles } from "@/db/schema";
import { toPublicTitle } from "@/lib/titles";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
	const rows = await db.select().from(titles).orderBy(desc(titles.createdAt));
	const catalog = rows.map(toPublicTitle);

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">CATALOG</p>
			<h1 className="mt-2 text-3xl font-bold">Discover something to watch</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Search by name or filter by genre, then open a title for synopsis, cast, and rating.
			</p>

			{catalog.length === 0 ? (
				<p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
					No titles yet. An admin can add movies and shows from the catalog management page.
				</p>
			) : (
				<CatalogBrowser titles={catalog} />
			)}
		</main>
	);
}
