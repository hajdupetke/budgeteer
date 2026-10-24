# Authorization integration tests

Use pnpm, a Node.js version supported by Vitest 5 (22.12–22.x, 24.x, or 26+), and an
isolated PostgreSQL database whose name ends in `_test`. The
runner requires `TEST_DATABASE_URL`, rejects the application `DATABASE_URL` when
it is identical, and never falls back to the application's connection string.
It applies existing migrations, generates Prisma and TypedSQL bindings, then
runs Vitest. No seed script runs.

For example, with PostgreSQL available locally:

```sh
TEST_DATABASE_URL='postgresql://postgres:password@localhost:5432/budgeteer_authorization_test' pnpm test:integration
```

The database must already exist and be disposable. Fixtures use unique user IDs,
clean up only their own records, and do not depend on seeded category IDs.
Authentication and Next.js cache invalidation are mocked; mutations, category
connections, ownership predicates, and rollback use real PostgreSQL queries.
The authentication-boundary test additionally spies on database entry points to
prove that invalid sessions never reach them. Cache-failure cases cover all nine
write actions: committed writes still return success when revalidation fails,
and cache/database error logs omit raw error messages and record data. A failed
revalidation may leave a view stale until it is refreshed, but does not report
the saved write as failed.

Other checks:

```sh
pnpm run lint
pnpm exec tsc --noEmit
pnpm run build
```

Manually verify creation, editing, and deletion in transaction, budget, and private
category dialogs. Successful mutations should refresh the relevant view. Failed
submissions should display a generic error and should not trigger success
callbacks. Confirm that shared categories remain available in selectors.

This suite covers the record-ownership TODO section. Arbitrary read options,
count isolation, broader input validation, and budget category replacement remain
separate backlog work.

## Verification on 2026-10-24

- All 22 integration tests passed using isolated PostgreSQL 18.4 and Node 26.11.1.
- `pnpm exec tsc --noEmit` passed after Prisma/TypedSQL generation.
- `pnpm run lint` passed with existing hook-dependency warnings in the date-range
  picker and pagination component.
- `pnpm run build` passed using the isolated database with the same existing
  hook-dependency warnings.
- Browser interaction with the OAuth-authenticated dialogs was not exercised;
  the manual checks above remain available for that verification.

No schema migrations or commits were created.
