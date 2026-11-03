import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, subscriptions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { latestPlanByUser, parseUserSort, sortUsers, type UserSort } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

const sortLinks: { sort: UserSort; label: string }[] = [
	{ sort: "newest", label: "Newest" },
	{ sort: "oldest", label: "Oldest" },
	{ sort: "name", label: "Name" },
];

function formatPlanName(name: string) {
	return name.charAt(0) + name.slice(1).toLowerCase();
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
	await requireAdmin();
	const sort = parseUserSort((await searchParams).sort);
	const userRows = await db
		.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
		.from(users);
	const activePlans = await db
		.select({ userId: subscriptions.userId, planName: plans.name, startedAt: subscriptions.startedAt })
		.from(subscriptions)
		.innerJoin(plans, eq(subscriptions.planId, plans.id))
		.where(eq(subscriptions.status, "ACTIVE"));
	const planByUser = latestPlanByUser(activePlans);
	const rows = sortUsers(userRows, sort);

	return (
		<main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
			<Link className="text-sm font-semibold text-violet-700 hover:underline" href="/admin">
				<span aria-hidden="true">← </span>Catalog management
			</Link>
			<p className="mt-6 text-sm font-semibold text-violet-700">ADMIN</p>
			<h1 className="mt-2 text-3xl font-bold">Registered users</h1>
			<p className="mt-2 text-slate-600">{rows.length} accounts</p>

			<nav aria-label="Sort users" className="mt-6 flex flex-wrap items-center gap-2 text-sm">
				<span className="text-slate-500">Sort by:</span>
				{sortLinks.map((link) => (
					<Link
						aria-current={link.sort === sort ? "true" : undefined}
						className={`rounded-full px-3 py-1 font-medium ${link.sort === sort ? "bg-violet-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}
						href={`/admin/users?sort=${link.sort}`}
						key={link.sort}
					>
						{link.label}
					</Link>
				))}
			</nav>

			<div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full min-w-[560px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
						<tr>
							<th className="px-4 py-3" scope="col">Name</th>
							<th className="px-4 py-3" scope="col">Email</th>
							<th className="px-4 py-3" scope="col">Role</th>
							<th className="px-4 py-3" scope="col">Plan</th>
							<th className="px-4 py-3" scope="col">Signed up</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{rows.map((user) => {
							const planName = planByUser.get(user.id);
							return (
								<tr key={user.id}>
									<td className="px-4 py-3 font-medium text-slate-950">{user.name}</td>
									<td className="px-4 py-3 break-all text-slate-600">{user.email}</td>
									<td className="px-4 py-3">
										<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${user.role === "ADMIN" ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700"}`}>
											{user.role === "ADMIN" ? "Admin" : "User"}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-700">{planName ? formatPlanName(planName) : <span className="text-slate-400">None</span>}</td>
									<td className="px-4 py-3 text-slate-600">
										<time dateTime={user.createdAt.toISOString()}>{user.createdAt.toLocaleDateString()}</time>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</main>
	);
}
