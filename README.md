# Streamly

A course project for a movie/show subscription service. The foundation maps directly to the product backlog: authentication and roles, catalog/admin tools, and subscriptions/personalization.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS v4
- Drizzle ORM with SQLite for local development

## Start developing

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Create and apply the schema with `npm run db:generate` then `npm run db:migrate`.
4. Add the starter plans with `npm run db:seed`.
5. Run `npm run dev` and visit `http://localhost:3000`.

Run `npm run lint` before opening a pull request and `npm run build` before merging a significant change.

## Project layout

- `src/app/`: routes and API handlers
- `src/db/schema.ts`: shared data model
- `src/db/index.ts`: server-only database connection
- `drizzle/`: generated migrations, committed to Git
- `scripts/seed.ts`: development seed data

Suggested ownership from the backlog:

- Auth: registration, login, sessions, role checks, profile, dashboard
- Catalog/Admin: title CRUD, search/filter, details, reviews, analytics
- Subscriptions: plans, mock checkout, subscription history, watchlist, content gating

## Deployment note

The checked-in configuration uses a local SQLite file for convenient development. Do not deploy that file database to Vercel: serverless filesystems are ephemeral, so writes will not reliably persist. Before deployment, move the same schema to a hosted database. Hosted SQLite through Turso/libSQL is the closest fit; Neon or Vercel Postgres are also solid choices. Keep the data access boundary in `src/db/` so this migration stays contained.

## Recommended next steps

1. Pick an authentication library and implement server-side authorization before exposing dashboard or admin routes.
2. Agree on the title metadata fields and migrations before members build forms independently.
3. Add Playwright end-to-end coverage for the Sprint 2 user journey: register, choose plan, browse, save a title.
