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

## Stripe test checkout

Paid plans use Stripe Checkout subscriptions in test mode. Set `STRIPE_SECRET_KEY` in `.env.local` to a Stripe test-mode secret key and set `APP_URL` to the local app URL. Never commit Stripe keys.

Install the Stripe CLI, authenticate it with your Stripe account, and forward webhook events to the app:

```sh
stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart the app. Apply database migrations with `npm run db:migrate`. Use Stripe's test card `4242 4242 4242 4242` with a future expiration date and any valid CVC/postal code. Checkout completion alone does not activate a paid plan; the verified webhook records the subscription. Users can schedule paid-plan cancellation at the end of the current billing period from their account dashboard; Stripe webhooks keep the local subscription status in sync.

## Project layout

- `src/app/`: routes and API handlers
- `src/db/schema.ts`: shared data model
- `src/db/index.ts`: server-only database connection
- `drizzle/`: generated migrations, committed to Git
- `scripts/seed.ts`: development seed data
- `docs/`: per-sprint implementation and verification notes

Suggested ownership from the backlog:

- Auth: registration, login, sessions, role checks, profile, dashboard
- Catalog/Admin: title CRUD, search/filter, details, reviews, analytics
- Subscriptions: plans, Stripe test-mode checkout and webhooks, subscription history, watchlist, content gating

## Deployment note

The checked-in configuration uses a local SQLite file for convenient development. Do not deploy that file database to Vercel: serverless filesystems are ephemeral, so writes will not reliably persist. Before deployment, move the same schema to a hosted database. Hosted SQLite through Turso/libSQL is the closest fit; Neon or Vercel Postgres are also solid choices. Keep the data access boundary in `src/db/` so this migration stays contained.

## Recommended next steps

1. Add a self-service billing portal for updating payment methods and reviewing invoices.
2. Agree on the title metadata fields and migrations before members build forms independently.
3. Add Playwright end-to-end coverage for registration, Stripe test checkout and webhook confirmation, browsing, and saving a title.
