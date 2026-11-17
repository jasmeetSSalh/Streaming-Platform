"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { watchlistItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function toggleWatchlist(formData: FormData) {
	const user = await requireUser();
	const titleId = String(formData.get("titleId") ?? "").trim();
	if (!titleId) return;

	const [existing] = await db
		.select({ id: watchlistItems.id })
		.from(watchlistItems)
		.where(and(eq(watchlistItems.userId, user.id), eq(watchlistItems.titleId, titleId)))
		.limit(1);

	if (existing) {
		await db.delete(watchlistItems).where(and(eq(watchlistItems.userId, user.id), eq(watchlistItems.titleId, titleId)));
	} else {
		await db.insert(watchlistItems).values({
			id: randomUUID(),
			userId: user.id,
			titleId,
			createdAt: new Date(),
		});
	}

	revalidatePath("/dashboard");
	revalidatePath("/watchlist");
	revalidatePath("/catalog");
	revalidatePath(`/catalog/${titleId}`);
}
