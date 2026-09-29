"use client";

import { useState } from "react";

const plans = [
	{ id: "plan-free", name: "Free", price: "$0", detail: "Catalog preview" },
	{ id: "plan-basic", name: "Basic", price: "$9.99", detail: "Standard catalog access" },
	{ id: "plan-premium", name: "Premium", price: "$14.99", detail: "Premium titles and features" },
];

export default function PlansPage() {
	const [userId, setUserId] = useState("");
	const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

	async function subscribe(planId: string, planName: string) {
		if (!userId.trim()) {
			setFeedback({ kind: "error", message: "Enter your existing user ID to continue." });
			return;
		}

		setPendingPlanId(planId);
		setFeedback(null);

		try {
			const response = await fetch("/api/subscription", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: userId.trim(), planId }),
			});
			const result = (await response.json()) as { error?: string };

			if (!response.ok) {
				throw new Error(result.error ?? "Unable to start subscription.");
			}

			setFeedback({ kind: "success", message: `${planName} subscription is now active.` });
		} catch (error) {
			setFeedback({
				kind: "error",
				message: error instanceof Error ? error.message : "Unable to reach the server.",
			});
		} finally {
			setPendingPlanId(null);
		}
	}

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">SUBSCRIPTIONS</p>
			<h1 className="mt-2 text-3xl font-bold">Choose your plan</h1>
			<p className="mt-2 max-w-2xl text-slate-600">
				Select a plan for your account. Plan availability and pricing are verified by the server.
			</p>

			<div className="mt-8 max-w-md">
				<label className="block text-sm font-medium text-slate-800" htmlFor="user-id">
					User ID
				</label>
				<input
					className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-700 focus:ring-2 focus:ring-violet-700/20"
					id="user-id"
					autoComplete="off"
					value={userId}
					onChange={(event) => setUserId(event.target.value)}
					placeholder="Enter an existing account ID"
				/>
			</div>

			<div className="mt-8 grid gap-5 md:grid-cols-3">
				{plans.map((plan) => (
					<article className="rounded-xl border border-slate-200 bg-white p-6" key={plan.id}>
						<h2 className="text-xl font-semibold">{plan.name}</h2>
						<p className="mt-3 text-3xl font-bold">
							{plan.price}
							<span className="text-sm font-normal text-slate-500">/month</span>
						</p>
						<p className="mt-4 text-slate-600">{plan.detail}</p>
						<button
							className="mt-6 rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							disabled={pendingPlanId !== null}
							onClick={() => void subscribe(plan.id, plan.name)}
						>
							{pendingPlanId === plan.id ? "Processing..." : `Choose ${plan.name}`}
						</button>
					</article>
				))}
			</div>

			{feedback && (
				<p
					className={`mt-6 text-sm ${feedback.kind === "success" ? "text-green-700" : "text-red-700"}`}
					role="status"
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
		</main>
	);
}
