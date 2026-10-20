"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TitlePoster } from "@/components/title-poster";
import { matchesCatalogQuery, uniqueGenres, type PublicTitle } from "@/lib/titles";

export function CatalogBrowser({ titles }: { titles: PublicTitle[] }) {
	const [query, setQuery] = useState("");
	const [genre, setGenre] = useState("");
	const genres = useMemo(() => uniqueGenres(titles), [titles]);
	const results = useMemo(
		() => titles.filter((title) => matchesCatalogQuery(title, query, genre)),
		[titles, query, genre],
	);

	return (
		<>
			<div className="mt-8 grid gap-4 md:grid-cols-[1fr_16rem]">
				<label className="block text-sm font-medium text-slate-800" htmlFor="catalog-search">
					Search by name
					<input
						className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="catalog-search"
						type="search"
						placeholder="Type part of a title"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</label>
				<label className="block text-sm font-medium text-slate-800" htmlFor="catalog-genre">
					Filter by genre
					<select
						className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="catalog-genre"
						value={genre}
						onChange={(event) => setGenre(event.target.value)}
					>
						<option value="">All genres</option>
						{genres.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>
			</div>

			<p className="mt-4 text-sm text-slate-600" role="status" aria-live="polite">
				{results.length} {results.length === 1 ? "title" : "titles"}
			</p>

			{results.length === 0 ? (
				<p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
					No titles match that search and genre.
				</p>
			) : (
				<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{results.map((title) => (
						<Link
							className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
							href={`/catalog/${title.id}`}
							key={title.id}
						>
							<TitlePoster name={title.name} posterUrl={title.posterUrl} />
							<div className="p-5">
								<h2 className="text-lg font-semibold text-slate-950">{title.name}</h2>
								<p className="mt-1 text-sm text-slate-600">{title.genre}</p>
							</div>
						</Link>
					))}
				</div>
			)}
		</>
	);
}
