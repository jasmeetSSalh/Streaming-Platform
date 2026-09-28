import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() { await requireAdmin(); return <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10"><p className="text-sm font-semibold text-violet-700">ADMIN</p><h1 className="mt-2 text-3xl font-bold">Catalog management</h1><div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Admin-only placeholder for title CRUD, users, and analytics.</div></main>; }
