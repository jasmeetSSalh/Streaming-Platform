"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type WatchlistButtonProps = {
	titleId: string;
	titleName: string;
	initialSaved: boolean;
	compact?: boolean;
};

export function WatchlistButton({ titleId, titleName, initialSaved, compact = false }: WatchlistButtonProps) {
	const router = useRouter();
	const [saved, setSaved] = useState(initialSaved);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function toggle() {
		const next = !saved;
		setPending(true);
		setError(null);
		setSaved(next);
		try {
			const response = await fetch("/api/watchlist", {
				method: next ? "POST" : "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ titleId }),
			});
			if (!response.ok) {
				const result: unknown = await response.json().catch(() => null);
				throw new Error(
					typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
						? result.error
						: "Unable to update your watchlist.",
				);
			}
			router.refresh();
		} catch (caught) {
			setSaved(!next);
			setError(caught instanceof Error ? caught.message : "Unable to update your watchlist.");
		} finally {
			setPending(false);
		}
	}

	const label = saved ? "Remove from watchlist" : "Add to watchlist";
	const base = compact
		? "w-full rounded-lg px-3 py-2 text-sm font-medium"
		: "inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold";
	const tone = saved
		? "border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100"
		: "bg-violet-700 text-white hover:bg-violet-800";

	return (
		<div className={compact ? "" : "mt-6"}>
			<button
				aria-label={`${label}: ${titleName}`}
				aria-pressed={saved}
				className={`${base} ${tone} disabled:cursor-wait disabled:opacity-60`}
				disabled={pending}
				onClick={toggle}
				type="button"
			>
				{saved ? "✓ On your watchlist" : "+ Add to watchlist"}
			</button>
			{error && (
				<p className="mt-2 text-sm text-red-700" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
