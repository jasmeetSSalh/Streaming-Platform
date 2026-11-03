"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reviews, titles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { parseReviewInput } from "@/lib/reviews";

export type ReviewState = { error?: string; success?: string };

export async function submitReview(_state: ReviewState, formData: FormData): Promise<ReviewState> {
	const user = await requireUser();
	const titleId = String(formData.get("titleId") ?? "").trim();
	if (!titleId) {
		return { error: "Title is required." };
	}

	const parsed = parseReviewInput(formData);
	if ("error" in parsed) {
		return { error: parsed.error };
	}

	const [title] = await db.select({ id: titles.id }).from(titles).where(eq(titles.id, titleId)).limit(1);
	if (!title) {
		return { error: "Title not found." };
	}

	try {
		await db
			.insert(reviews)
			.values({
				id: randomUUID(),
				userId: user.id,
				titleId,
				rating: parsed.data.rating,
				body: parsed.data.body,
				createdAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [reviews.userId, reviews.titleId],
				set: { rating: parsed.data.rating, body: parsed.data.body },
			});
	} catch {
		return { error: "Unable to save your review." };
	}

	revalidatePath(`/catalog/${titleId}`);
	revalidatePath("/admin/analytics");
	return { success: "Your review is saved." };
}
