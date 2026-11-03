"use client";

import { useActionState } from "react";
import { submitReview, type ReviewState } from "@/app/catalog/[id]/actions";

const initialState: ReviewState = {};

export function ReviewForm({
	titleId,
	existingRating,
	existingBody,
}: {
	titleId: string;
	existingRating: number | null;
	existingBody: string | null;
}) {
	const [state, action, pending] = useActionState(submitReview, initialState);
	const updating = existingRating != null;

	return (
		<form action={action} className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-white p-5">
			<input type="hidden" name="titleId" value={titleId} />
			<label className="block text-sm font-medium text-slate-800" htmlFor="review-rating">
				Rating
				<select
					className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
					defaultValue={existingRating ?? ""}
					id="review-rating"
					name="rating"
					required
				>
					<option value="" disabled>
						Choose 1 to 5 stars
					</option>
					<option value="1">1 star</option>
					<option value="2">2 stars</option>
					<option value="3">3 stars</option>
					<option value="4">4 stars</option>
					<option value="5">5 stars</option>
				</select>
			</label>
			<label className="block text-sm font-medium text-slate-800" htmlFor="review-body">
				Review (optional)
				<textarea
					className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
					defaultValue={existingBody ?? ""}
					id="review-body"
					name="body"
					placeholder="What did you think?"
				/>
			</label>
			{state.error && (
				<p className="text-sm text-red-700" role="alert">
					{state.error}
				</p>
			)}
			{state.success && (
				<p className="text-sm text-green-700" role="status">
					{state.success}
				</p>
			)}
			<button
				className="w-fit rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-60"
				disabled={pending}
				type="submit"
			>
				{pending ? "Saving..." : updating ? "Update review" : "Submit review"}
			</button>
		</form>
	);
}
