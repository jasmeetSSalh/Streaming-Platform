"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { destroyOtherSessions, requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { validateProfile } from "@/lib/profile";

export type ProfileState = { error?: string; success?: string };

export async function updateProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const field = (key: string) => String(formData.get(key) ?? "");
  const parsed = validateProfile({ name: field("name"), email: field("email"), newPassword: field("newPassword"), confirmPassword: field("confirmPassword") });
  if ("error" in parsed) return { error: parsed.error };
  const { name, email, newPassword } = parsed.data;

  // Changing credentials requires proof of the current password.
  if ((email !== user.email || newPassword) && !(await verifyPassword(field("currentPassword"), user.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  if (email !== user.email) {
    const [taken] = await db.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, user.id)));
    if (taken) return { error: "An account with that email already exists." };
  }

  try {
    await db.update(users).set({ name, email, ...(newPassword && { passwordHash: await hashPassword(newPassword) }) }).where(eq(users.id, user.id));
  } catch {
    return { error: "Unable to update profile." };
  }
  if (newPassword) await destroyOtherSessions(user.id);
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}
