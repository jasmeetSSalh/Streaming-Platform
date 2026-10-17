export type Role = "USER" | "ADMIN";

export const canAccessAdmin = (role: string) => role === "ADMIN";

/** HTTP status for an API request: 401 when signed out, 403 when the role is insufficient. */
export function apiAccessStatus(user: { role: string } | null, required: Role): 200 | 401 | 403 {
  if (!user) return 401;
  if (required === "ADMIN" && !canAccessAdmin(user.role)) return 403;
  return 200;
}
