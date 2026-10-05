import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, titles, watchlistItems } from "@/db/schema";
import { parseTitleInput, toPublicTitle } from "@/lib/titles";

type RouteContext = { params: Promise<{ id: string }> };

async function findTitle(id: string) {
	const [row] = await db.select().from(titles).where(eq(titles.id, id)).limit(1);
	return row ?? null;
}

export async function GET(_request: Request, context: RouteContext) {
	const { id } = await context.params;

	try {
		const row = await findTitle(id);
		if (!row) {
			return NextResponse.json({ error: "Title not found." }, { status: 404 });
		}

		return NextResponse.json({ title: toPublicTitle(row) });
	} catch {
		return NextResponse.json({ error: "Unable to load title." }, { status: 500 });
	}
}

export async function PATCH(request: Request, context: RouteContext) {
	const { id } = await context.params;
	const parsed = parseTitleInput(await request.json().catch(() => null));
	if ("error" in parsed) {
		return NextResponse.json({ error: parsed.error }, { status: 400 });
	}

	try {
		const existing = await findTitle(id);
		if (!existing) {
			return NextResponse.json({ error: "Title not found." }, { status: 404 });
		}

		const [row] = await db.update(titles).set(parsed.data).where(eq(titles.id, id)).returning();

		revalidatePath("/catalog");
		revalidatePath("/admin");

		return NextResponse.json({ title: toPublicTitle(row) });
	} catch {
		return NextResponse.json({ error: "Unable to update title." }, { status: 500 });
	}
}

export async function DELETE(_request: Request, context: RouteContext) {
	const { id } = await context.params;

	try {
		const existing = await findTitle(id);
		if (!existing) {
			return NextResponse.json({ error: "Title not found." }, { status: 404 });
		}

		await db.delete(watchlistItems).where(eq(watchlistItems.titleId, id));
		await db.delete(reviews).where(eq(reviews.titleId, id));
		await db.delete(titles).where(eq(titles.id, id));

		revalidatePath("/catalog");
		revalidatePath("/admin");

		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Unable to delete title." }, { status: 500 });
	}
}
