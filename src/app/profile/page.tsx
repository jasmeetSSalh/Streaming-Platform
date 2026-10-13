import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();
  return <main className="mx-auto max-w-md px-6 py-14"><p className="text-sm font-semibold text-violet-700">ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">Edit profile</h1><p className="mt-2 text-slate-600">Update your name, email, or password.</p><ProfileForm key={`${user.name}|${user.email}`} name={user.name} email={user.email} /></main>;
}
