# Authorization and safe data access integration tests

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

This suite covers the record-ownership and safe-data-access TODO sections.
Read tests cover two-user isolation, empty-user counts, strict input rejection,
minimal return fields, pagination, date ranges, and legacy cross-user category
links. OAuth account fixtures contain fake tokens to check that returned objects
cannot expose account credentials. Only the test file mocks the `server-only`
marker; production reads remain guarded by Next.js.

Mutation validation and database invariants are also covered. The validation
suite exercises malformed direct action calls, monetary boundaries, Unicode
text, raw SQL constraint failures, result limits, actual query cancellation, and
legacy-schema migration/audit refusal and success. Reporting arithmetic/timezone
policy, uncategorized-spending semantics, and budget category replacement remain
separate backlog work. See [validation and rollout details](../../docs/validation.md).

## Read API

All reads live in `src/lib/data.ts`, authenticate internally, and are available
only to server code. They are not exported as Server Actions. The action module
exports only the nine financial mutations and logout; inline OAuth actions still
use their fixed provider allowlist.

- `getTransactions`, `getCategories`, and `getBudgets` accept only `{ page,
  pageSize }`. Defaults are 6, 10, and 8 rows respectively; pages are bounded to
  1–1,000,000 and page sizes to 1–100. Ordering is fixed with an ID tie-breaker.
- `getCategories` and `getCategoryCount` cover the user's private categories.
  `getCategoryOptions` returns all owned/shared categories, with only ID, name,
  and icon. The selectors reject more than 1,000 visible categories rather than truncating.
- Report reads and `getTransactionCount` accept only an optional `{ range:
  { start: Date, end: Date } }`. Selected ranges are capped at five years; reports default to the last 12 months.
  Category and budget counts accept no filters.
  Unknown Prisma keys, ownership overrides, and relation selections are rejected.
- Decimal values stay on the server until presentation conversion. Financial
  reporting keeps its existing inclusive boundaries and weekly aggregation;
  SQL date truncation and omitted uncategorized spending are unchanged.
- Reports validate their date URL parameters once for counts and charts. ISO
  timestamps and ISO calendar dates are accepted; partial, repeated, invalid,
  and reversed ranges show an invalid-range message without report queries.
- Legacy forbidden category links are hidden in transaction/budget results.
  Category aggregate references that are no longer visible are returned as null
  and receive a generic label, without private names or IDs.

## Verification on 2026-10-24

- All 51 integration tests passed using isolated PostgreSQL 18.4 and Node 26.11.1.
- `pnpm exec tsc --noEmit` passed after Prisma/TypedSQL generation.
- `pnpm run lint` passed with existing pagination hook-dependency warnings.
- `pnpm run build` passed using the isolated database with the same existing
  hook-dependency warnings.
- The production Server Action manifest contains only the nine financial
  mutations, logout, and the inline OAuth sign-in action; no data readers or list
  components are exposed as actions.
- Browser interaction with the OAuth-authenticated dialogs was not exercised;
  the manual checks above remain available for that verification.

The new CHECK-constraint migration was applied only to the isolated test
database and temporary legacy-schema fixtures. Application databases were not
modified, and no commit was created.
