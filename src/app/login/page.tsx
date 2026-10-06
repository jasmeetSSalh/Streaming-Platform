"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "@/app/auth-actions";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);
  return <main className="mx-auto max-w-md px-6 py-14"><h1 className="text-3xl font-bold">Log in</h1><p className="mt-2 text-slate-600">Access your Streamly account.</p><form action={action} className="mt-8 grid gap-4"><label className="grid gap-1">Email<input className="rounded-lg border border-slate-300 px-3 py-2" type="email" name="email" autoComplete="email" required /></label><label className="grid gap-1">Password<input className="rounded-lg border border-slate-300 px-3 py-2" type="password" name="password" autoComplete="current-password" required /></label>{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}<button className="rounded-lg bg-violet-700 px-4 py-3 font-medium text-white disabled:opacity-60" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button></form><p className="mt-6 text-sm text-slate-600">New to Streamly? <Link className="text-violet-700 underline" href="/register">Create an account</Link></p></main>;
}
