# Member A — Sprint 3

## US-16 — Personal dashboard

- `/dashboard` (signed-in only) shows the user's current plan, a renewal/status line, account details, and a watchlist summary.
- `describeRenewal` in `src/lib/dashboard.ts` picks the status line: "Renews on <date>" for an active paid plan, "Access ends on <date>" once cancellation is scheduled, "Free plan, no renewal needed" for the free plan.
- The watchlist card lists the 5 most recently saved titles (`WATCHLIST_PREVIEW_LIMIT`) with a total count. Each poster links to its detail page. The card links to `/watchlist` (the full list, US-14) and the account card links to `/profile`.

**Verify:** `npm run test` covers the status line and the preview limit. Manually: a user with 7 saved titles sees the 5 newest and "(7)"; a paid user sees "Renews on …"; a free user sees the free-plan line and an empty-watchlist prompt; signed out, `/dashboard` redirects to `/login`.
