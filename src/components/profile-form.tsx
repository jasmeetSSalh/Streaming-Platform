"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";

const initialState: ProfileState = {};
const inputClass = "rounded-lg border border-slate-300 px-3 py-2";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  return (
    <form action={action} className="mt-8 grid gap-4">
      <label className="grid gap-1">Name<input className={inputClass} name="name" defaultValue={name} maxLength={80} autoComplete="name" required /></label>
      <label className="grid gap-1">Email<input className={inputClass} type="email" name="email" defaultValue={email} autoComplete="email" required /></label>
      <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Change password (optional)</legend>
        <label className="grid gap-1">New password<input className={inputClass} type="password" name="newPassword" autoComplete="new-password" /></label>
        <label className="grid gap-1">Confirm new password<input className={inputClass} type="password" name="confirmPassword" autoComplete="new-password" /></label>
      </fieldset>
      <label className="grid gap-1">Current password<span className="text-sm text-slate-500">Required to change your email or password.</span><input className={inputClass} type="password" name="currentPassword" autoComplete="current-password" /></label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
      <button className="rounded-lg bg-violet-700 px-4 py-3 font-medium text-white disabled:opacity-60" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
