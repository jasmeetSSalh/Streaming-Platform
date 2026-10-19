import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{ error: "Direct subscription creation is disabled. Use the authenticated checkout flow." },
		{ status: 410 },
	);
}
