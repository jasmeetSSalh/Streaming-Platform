import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans, subscriptions, users } from "@/db/schema";
import { authorizeApi } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/auth-policy";

export async function POST(request: Request) {
	const auth = await authorizeApi("USER");
	if (auth.response) return auth.response;

	const body = (await request.json().catch(() => null)) as {
		userId?: unknown;
		planId?: unknown;
	} | null;

	if (!body || typeof body.planId !== "string" || !body.planId.trim()) {
		return NextResponse.json({ error: "planId is required." }, { status: 400 });
	}

	// Subscribe the signed-in user. Only admins may act on another account.
	const userId = typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : auth.user.id;
	if (userId !== auth.user.id && !canAccessAdmin(auth.user.role)) {
		return NextResponse.json({ error: "You do not have permission to do that." }, { status: 403 });
	}
	const planId = body.planId.trim();

	try {
		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return NextResponse.json({ error: "User not found." }, { status: 404 });
		}

		const [plan] = await db
			.select({ id: plans.id, name: plans.name, monthlyPrice: plans.monthlyPrice })
			.from(plans)
			.where(eq(plans.id, planId))
			.limit(1);

		if (!plan) {
			return NextResponse.json({ error: "Plan not found." }, { status: 404 });
		}

		const [activeSubscription] = await db
			.select({ id: subscriptions.id })
			.from(subscriptions)
			.where(
				and(
					eq(subscriptions.userId, userId),
					eq(subscriptions.status, "ACTIVE"),
				),
			)
			.limit(1);

		if (activeSubscription) {
			return NextResponse.json(
				{ error: "User already has an active subscription." },
				{ status: 409 },
			);
		}

		const startedAt = new Date();
		const subscriptionId = globalThis.crypto.randomUUID();

		await db.insert(subscriptions).values({
			id: subscriptionId,
			userId,
			planId,
			status: "ACTIVE",
			startedAt,
		});

		return NextResponse.json(
			{
				subscription: {
					id: subscriptionId,
					userId,
					plan,
					status: "ACTIVE",
					startedAt: startedAt.toISOString(),
				},
			},
			{ status: 201 },
		);
	} catch {
		return NextResponse.json(
			{ error: "Unable to create subscription." },
			{ status: 500 },
		);
	}
}
