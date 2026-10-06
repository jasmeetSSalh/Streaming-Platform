# Member A — Sprint 1 authentication process

This document records the implementation and verification process for US-01, US-02, and US-03.

## Implementation flow

1. Keep account identity and `USER`/`ADMIN` role on the `users` row. Normalize email before use and rely on the unique database index to reject duplicate accounts.
2. Validate registration inputs on the server. Hash passwords with Node's built-in `scrypt` using a random salt; never store or return the raw password.
3. Create a random session token after successful login. Store only its SHA-256 hash, set the raw token in a seven-day `HttpOnly`, `SameSite=Lax` cookie, and use the database record to recover the signed-in user.
4. Check authentication in the server-rendered dashboard and check the current database role before rendering admin content. The shared navigation uses the server-verified user to show Dashboard and Admin links appropriately.
5. Apply the generated Drizzle migration before exercising the auth flows.

### Implementation note

The original plan proposed Argon2id. Its native package did not compile in this development environment because the C++ standard library header was unavailable. The code uses Node's built-in scrypt instead, avoiding a native package while keeping salted password hashing.

## Feature verification

### US-01 — Registration

- Automated checks cover email normalization/format validation, password strength, salted password hashing, and correct password verification.
- Manual flow: submit a malformed email, a weak password, and a valid email with a strong password; verify inline errors for the first two and a redirect to `/login?registered=1` for the valid account. Submit that normalized email again and verify the duplicate error.
- Verify account role is `USER` and `password_hash` contains a hash, not the submitted password.

### US-02 — Login and session

- Automated checks cover matching and non-matching password verification.
- Manual flow: log in with an incorrect password and confirm generic feedback; log in with valid credentials, refresh `/dashboard`, and confirm the user remains signed in; log out and confirm dashboard access redirects to login.
- Session expiry is seven days. The cookie is HttpOnly, SameSite=Lax, and Secure in production; the database stores only the token hash.

### US-03 — Role-based access

- Automated check confirms only `ADMIN` passes the admin role policy.
- Manual flow: as a regular user, open `/admin` directly and confirm an HTTP 403 and forbidden page; confirm Admin is absent from navigation. Set an existing test account's role to `ADMIN`, sign in, and confirm `/admin` and the Admin link are available.
- The dashboard requires a session. The admin check reads the role from the user record on the server.

## Verification record

- `npm run db:generate`: passed; created the sessions migration.
- `npm run db:migrate`: passed; migration applied to the local database.
- `npm run test`: passed (4 checks).
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: blocked twice by Turbopack failing to start a subprocess (`Operation not permitted`), including a retry outside the sandbox. The build result is unverified in this environment.

## Local commands

```sh
npm run db:migrate
npm run test
npm run lint
npx tsc --noEmit
npm run build
```
