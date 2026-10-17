import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { apiAccessStatus, canAccessAdmin, type Role } from "@/lib/auth-policy";

const COOKIE_NAME = "streamly_session";
const SESSION_DAYS = 7;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: randomUUID(), userId, tokenHash: hashToken(token), createdAt: now, expiresAt });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [row] = await db.select({ user: users, expiresAt: sessions.expiresAt }).from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, hashToken(token)));
  if (!row || row.expiresAt <= new Date()) return null;
  return row.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  cookieStore.delete(COOKIE_NAME);
}

/** Signs out every other device, e.g. after a password change. */
export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const others = token ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, hashToken(token))) : eq(sessions.userId, userId);
  await db.delete(sessions).where(others);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!canAccessAdmin(user.role)) forbidden();
  return user;
}

/**
 * Route-handler guard. Pages redirect, but APIs must answer with a status:
 * `const auth = await authorizeApi("ADMIN"); if (auth.response) return auth.response;`
 */
export async function authorizeApi(required: Role) {
  const user = await getCurrentUser();
  const status = apiAccessStatus(user, required);
  if (status === 401) return { user: null, response: NextResponse.json({ error: "Sign in required." }, { status }) } as const;
  if (status === 403) return { user: null, response: NextResponse.json({ error: "You do not have permission to do that." }, { status }) } as const;
  return { user: user!, response: null } as const;
}
