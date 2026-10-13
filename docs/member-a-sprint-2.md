# Member A — Sprint 2

## US-09 — Edit profile

- `/profile` (signed-in only) lets a user change name, email, and password via the `updateProfile` server action (`src/app/profile/actions.ts`).
- Validation lives in `src/lib/profile.ts`: name 1–80 chars, email normalized and format-checked, new password must meet the registration strength rule and match its confirmation. Password is optional — blank keeps the current one.
- Changing email or password requires the current password. Duplicate emails are rejected.
- A password change signs out all other sessions (`destroyOtherSessions`); the current session stays.
- `revalidatePath("/", "layout")` refreshes the nav and dashboard so changes show immediately.

**Verify:** `npm run test` covers validation. Manually: edit name → dashboard greeting updates; change email without current password → error; change password → log in elsewhere fails with the old one.

## US-10 — Server-side route protection

Roles are enforced on the server for every protected page and API, not just hidden in the UI.

| Surface | Rule | Unauthorized result |
| --- | --- | --- |
| `/dashboard`, `/profile` | `requireUser()` | redirect to `/login` |
| `/admin` | `requireAdmin()` | redirect (signed out) / 403 page |
| `POST /api/titles`, `PATCH`/`DELETE /api/titles/[id]` | `authorizeApi("ADMIN")` | 401 / 403 JSON |
| `POST /api/subscription` | `authorizeApi("USER")`; defaults to the session user, and only admins may pass another `userId` | 401 / 403 JSON |
| `GET /api/titles*`, `/api/health`, public pages | open | — |

- `apiAccessStatus()` in `src/lib/auth-policy.ts` is the pure 401/403 decision; `authorizeApi()` in `src/lib/auth.ts` wraps it with the session lookup. **New protected route handlers should start with `authorizeApi`.**
- Roles are always read from the database user row, never from the client.

**Verify:** `npm run test` covers the policy. A smoke run against `next start` with seeded sessions returned 401 (anon) / 403 (user) / 2xx (admin) for title writes, 401/403 for subscription misuse, and 403 for `/admin` as a user.
