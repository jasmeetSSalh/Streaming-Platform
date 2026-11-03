import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { titles, watchlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

async function readTitleId(request: Request) {
	const body: unknown = await request.json().catch(() => null);
	if (typeof body === "object" && body !== null && "titleId" in body && typeof body.titleId === "string" && body.titleId.trim()) {
		return body.titleId.trim();
	}
	return null;
}

function revalidateWatchlist(titleId: string) {
	revalidatePath("/watchlist");
	revalidatePath("/dashboard");
	revalidatePath("/catalog");
	revalidatePath(`/catalog/${titleId}`);
}

export async function POST(request: Request) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Log in to save titles to your watchlist." }, { status: 401 });

	const titleId = await readTitleId(request);
	if (!titleId) return NextResponse.json({ error: "A titleId is required." }, { status: 400 });

	try {
		const [title] = await db.select({ id: titles.id }).from(titles).where(eq(titles.id, titleId)).limit(1);
		if (!title) return NextResponse.json({ error: "Title not found." }, { status: 404 });

		await db
			.insert(watchlistItems)
			.values({ id: globalThis.crypto.randomUUID(), userId: user.id, titleId, createdAt: new Date() })
			.onConflictDoNothing({ target: [watchlistItems.userId, watchlistItems.titleId] });

		revalidateWatchlist(titleId);
		return NextResponse.json({ saved: true }, { status: 201 });
	} catch {
		return NextResponse.json({ error: "Unable to update your watchlist." }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Log in to manage your watchlist." }, { status: 401 });

	const titleId = await readTitleId(request);
	if (!titleId) return NextResponse.json({ error: "A titleId is required." }, { status: 400 });

	try {
		await db
			.delete(watchlistItems)
			.where(and(eq(watchlistItems.userId, user.id), eq(watchlistItems.titleId, titleId)));

		revalidateWatchlist(titleId);
		return NextResponse.json({ saved: false });
	} catch {
		return NextResponse.json({ error: "Unable to update your watchlist." }, { status: 500 });
	}
}
