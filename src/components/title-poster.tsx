type TitlePosterProps = {
	name: string;
	posterUrl: string | null;
	className?: string;
};

export function TitlePoster({ name, posterUrl, className }: TitlePosterProps) {
	return (
		<div className={`relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-violet-700 to-indigo-950 ${className ?? ""}`}>
			{posterUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					alt={`${name} poster`}
					className="h-full w-full object-cover"
					src={posterUrl}
				/>
			) : (
				<div className="flex h-full items-end p-4">
					<p className="text-sm font-medium text-white/90">{name}</p>
				</div>
			)}
		</div>
	);
}
