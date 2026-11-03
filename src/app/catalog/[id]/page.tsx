import { randomUUID } from "node:crypto";
import { avg, count, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { TitlePoster } from "@/components/title-poster";
import { db } from "@/db";
import { reviews, titleViews, titles, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getUserAccessLevel, hasPlanAccess } from "@/lib/subscription-access";
import { parseCastList } from "@/lib/titles";

export const dynamic = "force-dynamic";

type TitleDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function TitleDetailPage({ params }: TitleDetailPageProps) {
	const { id } = await params;
	const [title] = await db.select().from(titles).where(eq(titles.id, id)).limit(1);

	if (!title) {
		notFound();
	}

	const user = await getCurrentUser();
	const accessLevel = await getUserAccessLevel(user?.id);
	const canViewTitle = hasPlanAccess(accessLevel, title.requiredPlan);

	if (canViewTitle) {
		await db
			.update(titles)
			.set({ viewCount: sql`${titles.viewCount} + 1` })
			.where(eq(titles.id, id));
	}
	if (user && canViewTitle) {
		await db
			.insert(titleViews)
			.values({
				id: randomUUID(),
				userId: user.id,
				titleId: title.id,
				viewedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [titleViews.userId, titleViews.titleId],
				set: { viewedAt: new Date() },
			});
	}

	const [stats] = await db
		.select({
			average: avg(reviews.rating),
			total: count(reviews.id),
		})
		.from(reviews)
		.where(eq(reviews.titleId, id));

	const reviewRows = await db
		.select({
			id: reviews.id,
			rating: reviews.rating,
			body: reviews.body,
			createdAt: reviews.createdAt,
			authorName: users.name,
			userId: reviews.userId,
		})
		.from(reviews)
		.innerJoin(users, eq(reviews.userId, users.id))
		.where(eq(reviews.titleId, id))
		.orderBy(desc(reviews.createdAt));

	const reviewCount = Number(stats?.total ?? 0);
	const averageRating = stats?.average == null ? null : Number(stats.average);
	const cast = parseCastList(title.cast);
	const ownReview = user ? (reviewRows.find((row) => row.userId === user.id) ?? null) : null;

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<p className="text-sm font-semibold text-violet-700">
				<Link className="hover:underline" href="/catalog">
					CATALOG
				</Link>
			</p>
			<div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
				<div className="overflow-hidden rounded-xl border border-slate-200">
					<TitlePoster name={title.name} posterUrl={title.posterUrl} />
				</div>
				<div>
					<p className="text-sm font-medium text-slate-600">
						{title.type === "MOVIE" ? "Movie" : "Show"} · {title.releaseYear}
					</p>
					<h1 className="mt-2 text-3xl font-bold text-slate-950">{title.name}</h1>
					<p className="mt-3 text-sm font-medium text-violet-700">{title.genre}</p>
					{canViewTitle ? (
						<>
							<p className="mt-4 text-lg text-slate-800">
								{averageRating == null
									? "No ratings yet"
									: `Average rating ${averageRating.toFixed(1)} / 5 (${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})`}
							</p>
							<section className="mt-8">
								<h2 className="text-xl font-semibold text-slate-950">Synopsis</h2>
								<p className="mt-3 max-w-3xl leading-7 text-slate-700">{title.synopsis}</p>
							</section>
							<section className="mt-8">
								<h2 className="text-xl font-semibold text-slate-950">Cast</h2>
								{cast.length === 0 ? (
									<p className="mt-3 text-slate-600">Cast has not been listed yet.</p>
								) : (
									<ul className="mt-3 grid gap-2 sm:grid-cols-2">
										{cast.map((name) => (
											<li className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800" key={name}>
												{name}
											</li>
										))}
									</ul>
								)}
							</section>
						</>
					) : (
						<aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5" role="status">
							<h2 className="font-semibold text-amber-950">This title requires {title.requiredPlan.toLowerCase()} access</h2>
							<p className="mt-2 text-sm text-amber-900">Change your plan to unlock this title’s details.</p>
							<Link className="mt-4 inline-flex rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800" href="/plans">
								View plans
							</Link>
						</aside>
					)}
				</div>
			</div>

			<section className="mt-12 max-w-3xl">
				<h2 className="text-xl font-semibold text-slate-950">Ratings and reviews</h2>
				{user ? (
					<ReviewForm
						existingBody={ownReview?.body ?? null}
						existingRating={ownReview?.rating ?? null}
						key={`${ownReview?.rating ?? "new"}-${ownReview?.body ?? ""}`}
						titleId={title.id}
					/>
				) : (
					<p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-600">
						<Link className="font-medium text-violet-700 hover:underline" href={`/login?returnTo=/catalog/${title.id}`}>
							Log in
						</Link>{" "}
						to rate this title and leave an optional review.
					</p>
				)}

				{reviewRows.length === 0 ? (
					<p className="mt-6 text-slate-600">No reviews yet. Be the first to share what you thought.</p>
				) : (
					<ul className="mt-6 grid gap-4">
						{reviewRows.map((review) => (
							<li className="rounded-xl border border-slate-200 bg-white p-5" key={review.id}>
								<p className="font-semibold text-slate-950">{review.authorName}</p>
								<p className="mt-1 text-sm text-violet-700">
									{review.rating} / 5 stars
								</p>
								{review.body && <p className="mt-3 text-slate-700">{review.body}</p>}
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
