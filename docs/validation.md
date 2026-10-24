# Validation and database invariants

All financial mutations authenticate before parsing their inputs. Client schemas
provide feedback; server schemas are authoritative. Ownership remains enforced
in each write, and related-category connections remain atomic.

## Inputs and errors

Names are trimmed and contain 3–50 Unicode code points; icons are trimmed and
contain 1–32. IDs are positive PostgreSQL Int values. Transaction timestamps are
ISO timestamps with an offset, between 1900-01-01 UTC and the current time.
Transactions require a visible category on submission; stored null categories
remain supported after category deletion. Transaction type is INCOME or EXPENSE.

Transaction amounts and budget limits are decimal strings, greater than zero,
with at most two decimal places and a maximum of **999999999.99**. Examples:
`0.01`, `12.3`, `12.34`. Signs, leading-zero variants, separators, exponents,
nonfinite values, and trailing text are rejected. Values are passed directly to
Prisma Decimal without JavaScript floating-point parsing. Currency inputs retain
invalid text so that validation can explain it rather than silently changing it.

Budget requests accept 1–100 positive integer category IDs. The JSON field is
bounded to 4,096 characters before parsing, and array length is checked before
deduplication. Missing fields, File values, duplicate known fields, malformed
JSON, and non-FormData payloads produce INVALID_INPUT. Unrelated fields are
ignored and never control ownership. Create forms omit the optional record ID;
edit/delete record IDs are validated separately.

Mutation failures retain `{ success: false, error: { code, message } }`, with
optional `fieldErrors: Record<string, string[]>` on validation failures. Forms
map known field errors to their existing messages and retain a toast summary.
Authentication, unavailable-record, and unexpected-write error behavior is
unchanged. Cache revalidation remains separate from committed-write results.

## Read limits

Reports default to the preceding 12 calendar months. Default and maximum-span
calculations use UTC and clamp leap-day anniversaries. Selected ranges may span
at most five calendar years, with date endpoints between 1900 and 9999. Reports
resolve their range once for counts/charts and show it in the date picker.
Unfiltered list/dashboard counts still cover the user's lifetime records.

Pagination remains bounded to 100 rows per page. Category selectors, category
aggregate groups, and budget charts allow at most 1,000 results. Nested budget
categories allow at most 100. Queries fetch one extra result to detect overflow
and return RESULT_LIMIT_EXCEEDED instead of displaying partial data.

Read queries run in transactions with a local five-second PostgreSQL statement
timeout, a ten-second Prisma transaction deadline, and a five-second maximum
pool wait. The timeout setting does not persist on pooled connections. Read
failures use typed INVALID_INPUT, RESULT_LIMIT_EXCEEDED, or READ_TIMEOUT errors
with safe messages. Report controls remain available after a read failure.

Weekly grouping, inclusive date boundaries, SQL date truncation, dashboard
percentage arithmetic, and omitted uncategorized spending remain unchanged.
These financial/reporting semantics have separate backlog items.

## Audit and migration rollout

The migration is `20261024190000_validate_financial_invariants`. Prisma schema
comments identify its additional SQL CHECK constraints; the existing Decimal
column precision/scale is retained. The migration never rounds or repairs data.

Before applying it to an application database, explicitly configure the intended
DATABASE_URL and run:

```sh
pnpm db:check-invariants
```

The audit uses a read-only transaction. It prints only table names, rule names,
and violation counts; it does not print record IDs, names, amounts, or credentials.
It exits nonzero if violations exist or the audit cannot finish. The seven rules
cover transaction amounts/names/timestamps, budget limits/names, and category
names/icons. Names/icons use the same whitespace trimming and Unicode length
rules as the application. Money checks enforce positivity, the ceiling, and
stored two-decimal precision, including rejection of NaN. Timestamp checks require
finite values on or after 1900; future-date rejection remains application-level.

If the audit fails, stop and remediate records explicitly. Do not automatically
trim, round, delete, or otherwise rewrite existing financial data. After the
audit passes, apply migrations to the intended database with:

```sh
pnpm exec prisma migrate deploy
```

The migration repeats the preflight checks inside its transaction, then adds
named CHECK constraints. A failure rolls back all changes from this migration.
If Prisma has already recorded the migration as failed, after confirming the
rollback and resolving the reported data violations, mark that attempt rolled
back before retrying:

```sh
pnpm exec prisma migrate resolve --rolled-back 20261024190000_validate_financial_invariants
pnpm exec prisma migrate deploy
```

Category cardinality and cross-record authorization remain server-action rules;
existing foreign keys and enums remain in place. No migration was applied to an
application database during implementation, only the isolated test database and
its temporary legacy-schema fixtures. No commit was created.
