"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlanChangeButton({
	planId,
	planName,
}: {
	planId: string;
	planName: string;
}) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function changePlan() {
		setPending(true);
		setMessage(null);
		setError(null);
		try {
			const response = await fetch("/api/subscription/change", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ planId }),
			});
			const result: unknown = await response.json();
			if (!response.ok) {
				const message =
					typeof result === "object" &&
					result !== null &&
					"error" in result &&
					typeof result.error === "string"
						? result.error
						: "Unable to change your plan. Please try again.";
				throw new Error(message);
			}

			setMessage(`Your plan is now ${planName}. Your access has been updated.`);
			router.refresh();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unable to change your plan.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="mt-6">
			<button
				className="rounded-lg bg-violet-700 px-5 py-3 font-medium text-white hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60"
				disabled={pending}
				onClick={changePlan}
				type="button"
			>
				{pending ? "Updating your plan…" : `Confirm change to ${planName}`}
			</button>
			{message && <p className="mt-3 text-sm text-emerald-800" role="status">{message}</p>}
			{error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
		</div>
	);
}
