import { desc } from "drizzle-orm";
import { AdminCatalog } from "@/components/admin-catalog";
import { db } from "@/db";
import { titles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { toPublicTitle } from "@/lib/titles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	await requireAdmin();
	const rows = await db.select().from(titles).orderBy(desc(titles.createdAt));

	return <AdminCatalog initialTitles={rows.map(toPublicTitle)} />;
}
