import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans, subscriptions, users } from "@/db/schema";

export async function POST(request: Request) {
	const body = (await request.json().catch(() => null)) as {
		userId?: unknown;
		planId?: unknown;
	} | null;

	if (
		!body ||
		typeof body.userId !== "string" ||
		typeof body.planId !== "string" ||
		!body.userId.trim() ||
		!body.planId.trim()
	) {
		return NextResponse.json(
			{ error: "userId and planId are required." },
			{ status: 400 },
		);
	}

	const userId = body.userId.trim();
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
