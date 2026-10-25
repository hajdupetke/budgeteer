# Correctness regression checks

Run the validation and calculation tests with `pnpm test`.

The integration tests use real PostgreSQL queries and server actions, with only authentication and Next.js cache invalidation mocked. They create two temporary accounts and remove their fixtures afterward. They refuse to run without an explicit `TEST_DATABASE_URL` pointing to a database whose name ends in `_test`.

For a disposable local database:

```sh
docker run -d --name budgeteer-correctness-test \
  -e POSTGRES_PASSWORD=budgeteer-test \
  -e POSTGRES_DB=budgeteer_correctness_test \
  -p 127.0.0.1:55432:5432 postgres:16

export TEST_DATABASE_URL='postgresql://postgres:budgeteer-test@127.0.0.1:55432/budgeteer_correctness_test'
DATABASE_URL="$TEST_DATABASE_URL" pnpm exec prisma migrate deploy
DATABASE_URL="$TEST_DATABASE_URL" pnpm exec prisma generate --sql
pnpm test:integration
```

Wait for PostgreSQL to be ready before applying migrations. Do not use an application or production database for these checks. Stop and remove the disposable container when finished:

```sh
docker stop budgeteer-correctness-test
docker rm budgeteer-correctness-test
```

## Acceptance pass (2026-10-25)

- 42 validation/calculation tests and 11 PostgreSQL integration tests passed.
- Lint, TypeScript, Prisma client/typed SQL generation, and the production build passed. The build reports existing authentication dependency warnings about Edge Runtime APIs.
- Chromium checks used the dedicated test database and temporary signed sessions for two fictional accounts. Desktop (1440px) and mobile (390px) checks completed without browser runtime errors.
- Checked monthly dashboard totals and uncategorized data; normalized pagination and deleting the last item on page 2; transaction category clearing; client/server submission errors preserving values; switching budgets and replacing categories; report date clearing, history navigation, and invalid dates; and empty dashboard/report states for the second account.

These checks do not exercise a real OAuth provider login. Package-manager migration and dependency maintenance remain in TODO section 3.


## Core-app redesign acceptance pass (2026-10-25)

- 49 unit tests and 11 PostgreSQL integration tests passed. Added focused checks for budget remaining/over-budget values, capped progress, and category colors that remain stable across sorting, renaming, and palette overflow.
- Prisma generation, lint, TypeScript, and the production build passed using pnpm. No database schema migration was required.
- Chromium acceptance checks ran against the production build with fictional data in an isolated database. Checked all four screens at 1440px and 390px; 320px overflow; tablet layouts; and an effective 200% desktop viewport.
- Verified dashboard transaction creation, client validation, uncategorized data, category editing in one dialog, budget category removal using the keyboard, category replacement, form resets, date clearing, invalid-date feedback, mobile navigation closing/focus return, and empty states for a second account. No browser runtime errors occurred.
- Independent visual review found transaction actions clipped in the tablet table. Compact rows now remain below 1280px. Production checks confirmed Edit/Delete visibility and keyboard focus at 768, 1023, 1024, 1279, 1280, and 1440px. The reviewer scored this finding resolved and returned **ship** for the correction.
- No PRODUCT.md, DESIGN.md, design sidecars, or surface briefs were created, as requested. OAuth provider sign-in remains outside this local acceptance pass.
