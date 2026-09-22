import Link from "next/link";

const milestones = [
  ["Sprint 1", "Foundation", "Auth, roles, catalog CRUD, and plans"],
  ["Sprint 2", "Core journey", "Search, details, mock checkout, and watchlist"],
  ["Sprint 3", "Integration", "Ratings, dashboards, testing, and polish"],
];

export default function Home() {
  return <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 sm:px-10"><section className="max-w-3xl"><p className="text-sm font-semibold tracking-[0.18em] text-violet-700 uppercase">Movie subscription platform</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">A solid starting point for your streaming app.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Browse a catalog, compare plans, save titles, and build the admin workflows from one shared foundation.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-lg bg-violet-700 px-5 py-3 font-medium text-white hover:bg-violet-800" href="/catalog">Browse catalog</Link><Link className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-800 hover:bg-slate-100" href="/plans">View plans</Link></div></section><section className="mt-16 grid gap-4 md:grid-cols-3">{milestones.map(([sprint, title, detail]) => <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" key={sprint}><p className="text-sm font-semibold text-violet-700">{sprint}</p><h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2><p className="mt-3 text-slate-600">{detail}</p></article>)}</section></main>;
}
