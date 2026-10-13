# Member A — Sprint 2

## US-09 — Edit profile

- `/profile` (signed-in only) lets a user change name, email, and password via the `updateProfile` server action (`src/app/profile/actions.ts`).
- Validation lives in `src/lib/profile.ts`: name 1–80 chars, email normalized and format-checked, new password must meet the registration strength rule and match its confirmation. Password is optional — blank keeps the current one.
- Changing email or password requires the current password. Duplicate emails are rejected.
- A password change signs out all other sessions (`destroyOtherSessions`); the current session stays.
- `revalidatePath("/", "layout")` refreshes the nav and dashboard so changes show immediately.

**Verify:** `npm run test` covers validation. Manually: edit name → dashboard greeting updates; change email without current password → error; change password → log in elsewhere fails with the old one.
