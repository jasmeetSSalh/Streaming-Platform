import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { titles } from "@/db/schema";
import { parseTitleInput, toPublicTitle } from "@/lib/titles";

export async function GET() {
	try {
		const rows = await db.select().from(titles).orderBy(desc(titles.createdAt));
		return NextResponse.json({ titles: rows.map(toPublicTitle) });
	} catch {
		return NextResponse.json({ error: "Unable to load catalog." }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const parsed = parseTitleInput(await request.json().catch(() => null));
	if ("error" in parsed) {
		return NextResponse.json({ error: parsed.error }, { status: 400 });
	}

	try {
		const createdAt = new Date();
		const id = globalThis.crypto.randomUUID();
		const [row] = await db
			.insert(titles)
			.values({
				id,
				...parsed.data,
				createdAt,
			})
			.returning();

		revalidatePath("/catalog");
		revalidatePath("/admin");

		return NextResponse.json({ title: toPublicTitle(row) }, { status: 201 });
	} catch {
		return NextResponse.json({ error: "Unable to add title." }, { status: 500 });
	}
}
