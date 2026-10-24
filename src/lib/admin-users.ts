export const USER_SORTS = ["newest", "oldest", "name"] as const;
export type UserSort = (typeof USER_SORTS)[number];

export function parseUserSort(value: unknown): UserSort {
	return USER_SORTS.includes(value as UserSort) ? (value as UserSort) : "newest";
}

type SortableUser = { name: string; createdAt: Date };

export function sortUsers<T extends SortableUser>(rows: T[], sort: UserSort) {
	return [...rows].sort((a, b) => {
		if (sort === "name") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
		const byDate = a.createdAt.getTime() - b.createdAt.getTime();
		return sort === "oldest" ? byDate : -byDate;
	});
}

/** Maps each user to the plan of their most recent active subscription. */
export function latestPlanByUser(rows: { userId: string; planName: string; startedAt: Date }[]) {
	const latest = new Map<string, { planName: string; startedAt: Date }>();
	for (const row of rows) {
		const current = latest.get(row.userId);
		if (!current || row.startedAt > current.startedAt) latest.set(row.userId, row);
	}
	return new Map([...latest].map(([userId, row]) => [userId, row.planName]));
}
