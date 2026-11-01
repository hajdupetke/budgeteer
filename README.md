# Budgeteer

Budgeteer is a personal finance tracker for EUR transactions, monthly budgets, and spending reports. It uses Next.js 15, Auth.js, Prisma, and PostgreSQL.

## Local setup

Use Node.js 24 and the pnpm version pinned in `package.json`. Docker Compose is needed for the local PostgreSQL 16 database.

```bash
cp .env.example .env
```

Set `AUTH_SECRET` in `.env` to the output of `openssl rand -base64 32`. The example `DATABASE_URL` connects to the Compose database at `localhost:5432`. `AUTH_TRUST_HOST=true` lets a local production server accept localhost requests; on a hosted reverse proxy, use it only if the proxy validates Host headers. For personal sign-in, create Google or GitHub OAuth credentials and fill in the matching `AUTH_*_ID` and `AUTH_*_SECRET` values.

```bash
pnpm install --frozen-lockfile
pnpm db:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `db:setup` starts the database, deploys migrations, generates Prisma Client and typed SQL, and creates shared default categories. It does not create a personal user or demo data. If Docker reports a socket permission error, ensure your login session has Docker access before rerunning the command.

## Optional read-only demo

Run `pnpm db:seed:demo`, then set `DEMO_ENABLED="true"` in `.env` and restart the app (or rebuild for production). The landing and sign-in pages will offer **Try read-only demo**. It opens the normal dashboard, transactions, budgets, and reports with fictional data from the current and previous two UTC months. Server actions reject demo writes. The dedicated demo user and its records are separate from personal accounts; rerunning this seed replaces only that user's transactions and budgets. Refresh the seed periodically so the dates stay recent.

## Checks and database commands

```bash
pnpm check                  # lint, typecheck, unit tests
pnpm build                  # production build, after db:setup
pnpm db:migrate             # deploy existing migrations
pnpm db:generate            # regenerate Prisma Client and typed SQL
pnpm db:seed                # idempotent shared categories
```

The integration suite requires a migrated, dedicated database whose name ends in `_test`; set `TEST_DATABASE_URL` and run `pnpm test:integration`. Do not point it at the application database.

## Deployment configuration

Set `DATABASE_URL` to a production PostgreSQL URL and `AUTH_SECRET` to a private random value. Configure `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` and/or `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` for personal sign-in. Register `https://YOUR_HOST/api/auth/callback/google` and `https://YOUR_HOST/api/auth/callback/github` with the respective providers. The deployment build command is `pnpm vercel-build`; it deploys migrations and generates Prisma bindings before building, but does not seed data. Run `pnpm db:seed` separately for shared categories. To offer the demo, run `pnpm db:seed:demo` against the intended database and set `DEMO_ENABLED="true"`.

Hosted OAuth callbacks, logout, refreshes, migration, and remote images still need verification on an actual deployment. The app currently allows profile images from Google (`lh3.googleusercontent.com`) and GitHub (`avatars.githubusercontent.com`).

The production dependency audit is clear as of October 2026. The full audit still reports a [high-severity advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) in `deepmerge-ts` through Prisma 6's development tooling; Prisma 6.19.3 is the latest 6.x release. Upgrading Prisma itself requires a separate migration review.
