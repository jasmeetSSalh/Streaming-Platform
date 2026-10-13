import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() { const user = await requireUser(); return <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10"><p className="text-sm font-semibold text-violet-700">ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">Welcome, {user.name}</h1><p className="mt-2 text-slate-600">Signed in as {user.email} · <Link className="text-violet-700 underline" href="/profile">Edit profile</Link></p><div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Protected-user dashboard placeholder: current plan and watchlist summary belong here.</div></main>; }
