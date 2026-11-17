import { toggleWatchlist } from "@/app/watchlist/actions";

type WatchlistButtonProps = {
	titleId: string;
	saved: boolean;
};

export function WatchlistButton({ titleId, saved }: WatchlistButtonProps) {
	return (
		<form action={toggleWatchlist} className="inline-block">
			<input type="hidden" name="titleId" value={titleId} />
			<button
				className={[
					"inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700",
					saved
						? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
						: "bg-violet-700 text-white hover:bg-violet-800",
				].join(" ")}
				type="submit"
			>
				{saved ? "Remove from watchlist" : "Add to watchlist"}
			</button>
		</form>
	);
}
