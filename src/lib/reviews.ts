export type ReviewInput = {
	rating: number;
	body: string | null;
};

export function parseReviewInput(formData: FormData): { data: ReviewInput } | { error: string } {
	const ratingRaw = String(formData.get("rating") ?? "").trim();
	const rating = Number(ratingRaw);
	const body = String(formData.get("body") ?? "").trim();

	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		return { error: "Choose a rating from 1 to 5 stars." };
	}

	return { data: { rating, body: body.length > 0 ? body : null } };
}
