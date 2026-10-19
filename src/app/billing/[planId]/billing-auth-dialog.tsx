"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register, type AuthState } from "@/app/auth-actions";

const initialState: AuthState = {};

export function BillingAuthDialog({ returnTo }: { returnTo: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [registerState, registerAction, registerPending] = useActionState(register, initialState);
  const isRegistering = mode === "register";
  const state = isRegistering ? registerState : loginState;
  const pending = isRegistering ? registerPending : loginPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
      <section
        aria-labelledby="billing-auth-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-xl bg-white p-6 shadow-xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold text-violet-700">YOUR PLAN IS READY</p>
          <Link
            aria-label="Close sign-in and return to plans"
            className="-mr-2 -mt-2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            href="/plans"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
        </div>
        <h2 className="mt-2 text-2xl font-bold" id="billing-auth-title">
          {isRegistering ? "Create your account" : "Log in to continue"}
        </h2>
        <p className="mt-2 text-slate-600">
          Sign in or create an account to continue with this plan.
        </p>

        <form action={isRegistering ? registerAction : loginAction} className="mt-6 grid gap-4">
          <input name="returnTo" type="hidden" value={returnTo} />
          <label className="grid gap-1">
            Email
            <input
              autoComplete="email"
              className="rounded-lg border border-slate-300 px-3 py-2"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="grid gap-1">
            Password
            <input
              autoComplete={isRegistering ? "new-password" : "current-password"}
              className="rounded-lg border border-slate-300 px-3 py-2"
              minLength={isRegistering ? 12 : undefined}
              name="password"
              required
              type="password"
            />
          </label>
          {state.error && (
            <p className="text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}
          <button
            className="rounded-lg bg-violet-700 px-4 py-3 font-medium text-white disabled:opacity-60"
            disabled={pending}
          >
            {pending
              ? isRegistering
                ? "Creating account…"
                : "Logging in…"
              : isRegistering
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          {isRegistering ? "Already have an account?" : "New to Streamly?"}{" "}
          <button
            className="font-medium text-violet-700 underline"
            onClick={() => setMode(isRegistering ? "login" : "register")}
            type="button"
          >
            {isRegistering ? "Log in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}
