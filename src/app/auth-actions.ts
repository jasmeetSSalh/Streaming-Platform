"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, validateRegistration, verifyPassword } from "@/lib/password";

export type AuthState = { error?: string };

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const validation = validateRegistration(email, password);
  if (!validation.emailIsValid) return { error: "Enter a valid email address." };
  if (!validation.passwordIsStrong) return { error: "Use 12+ characters and at least three character types." };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, validation.email));
  if (existing) return { error: "An account with that email already exists." };
  try {
    await db.insert(users).values({
      id: randomUUID(), name: validation.email.split("@")[0], email: validation.email,
      passwordHash: await hashPassword(password), role: "USER", createdAt: new Date(),
    });
  } catch {
    return { error: "An account with that email already exists." };
  }
  redirect("/login?registered=1");
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
