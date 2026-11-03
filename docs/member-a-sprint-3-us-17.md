# Member A — Sprint 3: US-17 — Admin user list

- `/admin/users` (admin only, via `requireAdmin()`) lists every account with name, email, role, current plan, and signup date. It is linked from the admin catalog page.
- Plan is the user's most recent `ACTIVE` subscription (`latestPlanByUser`). Users without one show "None".
- `?sort=newest|oldest|name` controls ordering (`parseUserSort` / `sortUsers` in `src/lib/admin-users.ts`). Unknown values fall back to newest. Name sort is case-insensitive.

**Verify:** `npm run test` covers sorting, sort parsing, and plan selection. Manually: signed out → redirect to `/login`; regular user → 403; admin → table, and each sort link reorders the rows.
