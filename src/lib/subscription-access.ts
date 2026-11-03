import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, subscriptions } from "@/db/schema";
import type { PlanLevel } from "@/lib/titles";

export { hasPlanAccess } from "@/lib/plan-access";

export async function getUserAccessLevel(userId: string | null | undefined): Promise<PlanLevel> {
	if (!userId) return "FREE";

	const [subscription] = await db
		.select({ accessLevel: plans.accessLevel })
		.from(subscriptions)
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "ACTIVE")))
		.orderBy(desc(subscriptions.startedAt))
		.limit(1);

	return subscription?.accessLevel ?? "FREE";
}
