import Link from "next/link";

export default function Forbidden() {
  return <main className="mx-auto max-w-2xl px-6 py-16"><h1 className="text-3xl font-bold">403 — Access denied</h1><p className="mt-3 text-slate-600">Your account does not have permission to view this page.</p><Link className="mt-6 inline-block text-violet-700 underline" href="/">Return home</Link></main>;
}
