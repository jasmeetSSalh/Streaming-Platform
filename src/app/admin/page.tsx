import { desc } from "drizzle-orm";
import { AdminCatalog } from "@/components/admin-catalog";
import { db } from "@/db";
import { titles } from "@/db/schema";
import { toPublicTitle } from "@/lib/titles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const rows = await db.select().from(titles).orderBy(desc(titles.createdAt));

	return <AdminCatalog initialTitles={rows.map(toPublicTitle)} />;
}
