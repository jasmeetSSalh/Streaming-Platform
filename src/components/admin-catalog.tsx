"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TitlePoster } from "@/components/title-poster";
import type { PublicTitle, TitleType } from "@/lib/titles";

const emptyForm = {
	name: "",
	type: "MOVIE" as TitleType,
	genre: "",
	synopsis: "",
	posterUrl: "",
	releaseYear: String(new Date().getFullYear()),
};

type FormState = typeof emptyForm;

export function AdminCatalog({ initialTitles }: { initialTitles: PublicTitle[] }) {
	const router = useRouter();
	const [form, setForm] = useState<FormState>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<PublicTitle | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

	function startEdit(title: PublicTitle) {
		setEditingId(title.id);
		setForm({
			name: title.name,
			type: title.type,
			genre: title.genre,
			synopsis: title.synopsis,
			posterUrl: title.posterUrl ?? "",
			releaseYear: String(title.releaseYear),
		});
		setFeedback(null);
	}

	function resetForm() {
		setEditingId(null);
		setForm(emptyForm);
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setFeedback(null);
		const wasEditing = Boolean(editingId);

		try {
			const payload = {
				name: form.name,
				type: form.type,
				genre: form.genre,
				description: form.synopsis,
				posterUrl: form.posterUrl,
				releaseYear: Number(form.releaseYear),
			};

			const response = await fetch(editingId ? `/api/titles/${editingId}` : "/api/titles", {
				method: editingId ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const result = (await response.json()) as { error?: string };

			if (!response.ok) {
				throw new Error(result.error ?? "Unable to save title.");
			}

			resetForm();
			router.refresh();
			setFeedback({
				kind: "success",
				message: wasEditing ? "Title updated." : "Title added to the catalog.",
			});
		} catch (error) {
			setFeedback({
				kind: "error",
				message: error instanceof Error ? error.message : "Unable to save title.",
			});
		} finally {
			setSaving(false);
		}
	}

	async function confirmDelete() {
		if (!pendingDelete) {
			return;
		}

		setDeleting(true);
		setFeedback(null);

		try {
			const response = await fetch(`/api/titles/${pendingDelete.id}`, { method: "DELETE" });
			const result = (await response.json()) as { error?: string };
			if (!response.ok) {
				throw new Error(result.error ?? "Unable to delete title.");
			}

			if (editingId === pendingDelete.id) {
				resetForm();
			}

			setPendingDelete(null);
			router.refresh();
			setFeedback({ kind: "success", message: "Title removed from the catalog." });
		} catch (error) {
			setFeedback({
				kind: "error",
				message: error instanceof Error ? error.message : "Unable to delete title.",
			});
		} finally {
			setDeleting(false);
		}
	}

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">ADMIN</p>
			<h1 className="mt-2 text-3xl font-bold">Catalog management</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Add a movie or show, correct existing details, or remove a title from the catalog.
			</p>

			<form className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2" onSubmit={onSubmit}>
				<h2 className="md:col-span-2 text-xl font-semibold text-slate-950">
					{editingId ? "Edit title" : "Add a new title"}
				</h2>

				<label className="block text-sm font-medium text-slate-800" htmlFor="title-name">
					Title
					<input
						className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-name"
						required
						value={form.name}
						onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
					/>
				</label>

				<label className="block text-sm font-medium text-slate-800" htmlFor="title-type">
					Type
					<select
						className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-type"
						value={form.type}
						onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as TitleType }))}
					>
						<option value="MOVIE">Movie</option>
						<option value="SHOW">Show</option>
					</select>
				</label>

				<label className="block text-sm font-medium text-slate-800" htmlFor="title-genre">
					Genre
					<input
						className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-genre"
						required
						value={form.genre}
						onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))}
					/>
				</label>

				<label className="block text-sm font-medium text-slate-800" htmlFor="title-year">
					Release year
					<input
						className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-year"
						required
						type="number"
						min={1888}
						max={new Date().getFullYear() + 5}
						value={form.releaseYear}
						onChange={(event) => setForm((current) => ({ ...current, releaseYear: event.target.value }))}
					/>
				</label>

				<label className="md:col-span-2 block text-sm font-medium text-slate-800" htmlFor="title-poster">
					Poster URL
					<input
						className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-poster"
						type="url"
						placeholder="https://example.com/poster.jpg"
						value={form.posterUrl}
						onChange={(event) => setForm((current) => ({ ...current, posterUrl: event.target.value }))}
					/>
				</label>

				<label className="md:col-span-2 block text-sm font-medium text-slate-800" htmlFor="title-description">
					Description
					<textarea
						className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
						id="title-description"
						required
						value={form.synopsis}
						onChange={(event) => setForm((current) => ({ ...current, synopsis: event.target.value }))}
					/>
				</label>

				<div className="md:col-span-2 flex flex-wrap gap-3">
					<button
						className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
						disabled={saving}
						type="submit"
					>
						{saving ? "Saving..." : editingId ? "Save changes" : "Add to catalog"}
					</button>
					{editingId && (
						<button
							className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
							onClick={resetForm}
							type="button"
						>
							Cancel edit
						</button>
					)}
				</div>
			</form>

			{feedback && (
				<p
					className={`mt-6 text-sm ${feedback.kind === "success" ? "text-green-700" : "text-red-700"}`}
					role="status"
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}

			<section className="mt-10">
				<h2 className="text-xl font-semibold text-slate-950">Existing titles</h2>
				{initialTitles.length === 0 ? (
					<p className="mt-4 text-slate-600">No titles in the catalog yet.</p>
				) : (
					<ul className="mt-4 grid gap-4">
						{initialTitles.map((title) => (
							<li className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center" key={title.id}>
								<div className="w-full max-w-24 overflow-hidden rounded-lg">
									<TitlePoster name={title.name} posterUrl={title.posterUrl} />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="font-semibold text-slate-950">{title.name}</h3>
									<p className="mt-1 text-sm text-slate-600">
										{title.genre} · {title.type === "MOVIE" ? "Movie" : "Show"} · {title.releaseYear}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
										type="button"
										onClick={() => startEdit(title)}
									>
										Edit
									</button>
									<button
										className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
										type="button"
										onClick={() => setPendingDelete(title)}
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			{pendingDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
					<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="delete-title">
						<h2 className="text-lg font-semibold text-slate-950" id="delete-title">
							Delete this title?
						</h2>
						<p className="mt-2 text-slate-600">
							{pendingDelete.name} will be removed from the catalog. This cannot be undone.
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
								disabled={deleting}
								type="button"
								onClick={() => setPendingDelete(null)}
							>
								Cancel
							</button>
							<button
								className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
								disabled={deleting}
								type="button"
								onClick={() => void confirmDelete()}
							>
								{deleting ? "Deleting..." : "Delete title"}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
