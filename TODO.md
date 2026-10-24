# Budgeteer improvement backlog

Based on the repository review of 2026-10-24. Complete security and financial
correctness work before adding product scope or accepting real financial data.
Use pnpm for all package management and script execution.

## P0 — Security blockers

### Record ownership and authorization

- [x] Scope every transaction, budget, and private category update/delete to both record ID and the authenticated user's ID in the database operation itself.
- [x] Remove owner reassignment from transaction and budget edits.
- [x] Make shared default categories readable but immutable by ordinary users.
- [x] Reject unauthorized or missing records consistently without exposing whether
      another user's record exists.
- [x] Validate related categories on transaction and budget creation/editing:
      each must belong to the user or be an approved shared category.
- [x] Reject the entire request if any requested category is missing or forbidden.
- [x] Require a valid authenticated user ID at every protected action boundary.

Acceptance: integration tests with two users prove that neither can edit, delete,
claim, or attach the other's private records. Test shared category protections too.

### Safe data access

- [x] Replace arbitrary caller-supplied Prisma options with narrow, validated
      inputs for pagination, filtering, and approved sorting.
- [x] Ensure caller filters cannot overwrite or weaken mandatory ownership filters.
- [x] Scope all count helpers to the authenticated user, including dashboard and
      reports empty-state checks.
- [x] Move internal database read helpers out of the module-level `use server`
      action surface into a `server-only` data access module.
- [x] Return explicit, minimal data objects; disallow arbitrary relation includes
      and selections, especially user/account/token relations.
- [x] Review all exported Server Actions as externally callable boundaries

Acceptance: tests cover empty/foreign-user filters, attempted nested relation
selection, counts, and unauthenticated calls. No financial records or account
tokens can escape through read helpers.

### Server-side validation and database invariants

- [x] Parse all action inputs with server-side schemas; retain client validation
      for usability.
- [x] Validate positive integer IDs, trimmed names, bounded strings, permitted
      enum values, valid dates, and bounded category arrays.
- [x] Validate finite positive monetary amounts, supported precision, and a
      documented maximum amount.
- [x] Handle malformed JSON, missing form fields, invalid timestamps, and
      unsupported report aggregation steps with structured errors.
- [x] Bound report ranges and query sizes; prevent unbounded caller-controlled
      reads and expensive aggregations.
- [x] Add database constraints for positive amounts/limits and other persistent
      business invariants after checking existing data.

Acceptance: direct action calls that bypass browser validation cannot persist
invalid data. Validation failures produce useful errors rather than raw exceptions.

### Dependencies and configuration

- [ ] Adopt one committed pnpm lockfile and remove the obsolete npm lockfile as
      part of the intentional package-manager migration.
- [ ] Declare the intended pnpm and Node.js versions and document them.
- [ ] Reconcile package declarations, lockfile, and installed versions; verify with
      a clean frozen installation.
- [ ] Upgrade the committed Next.js baseline past applicable security advisories
      and choose a currently supported, patched release.
- [ ] Review React/RSC packages together with Next.js; do not infer framework
      vulnerability solely from the top-level React version.
- [ ] Run `pnpm audit`; triage dependency paths and runtime/build exposure, then
      fix or document each remaining advisory with a reason and review date.
- [ ] Recheck the review's six pnpm audit findings: PostCSS, deepmerge-ts, and Zod
      advisories may change as packages and advisory records change.
- [ ] Add automated dependency update proposals and security checks.
- [ ] Bind local PostgreSQL to localhost; label Compose credentials as development
      only and keep production database access private.
- [ ] Replace the misleading example authentication secret with setup instructions
      for generating a strong secret; validate required environment configuration.
- [ ] Restrict image optimization to the actual supported avatar hosts.
- [ ] Add sensible mutation/report rate limits or quotas with documented hosting
      protections; do not rely on UI controls for abuse prevention.

Acceptance: a fresh checkout installs reproducibly with pnpm, the old vulnerable
framework baseline is gone, and remaining audit findings have explicit dispositions.

## P1 — Financial correctness

### Dashboard and reporting

- [ ] Correct percentage change to `(current - previous) / previous * 100`.
- [ ] Define display behavior for zero previous values, zero current values, and
      missing data; format amounts and percentages consistently.
- [ ] Decide whether dashboard periods are calendar months or rolling periods;
      label them accurately and implement consistent comparisons.
- [ ] Standardize reporting on inclusive start / exclusive end boundaries.
- [ ] Define a user timezone policy and apply it consistently to storage,
      filtering, grouping, and display.
- [ ] Stop truncating timestamp boundaries to `DATE` in `incomeExpense.sql`.
- [ ] Add explicit chronological ordering to the income/expense SQL query.
- [ ] Fill missing chart periods with zero values.
- [ ] Validate date query parameters, including invalid, partial, and reversed
      ranges; make date-picker clearing/reset behavior explicit.
- [ ] Include uncategorized expenses in category breakdowns.
- [ ] Handle missing category lookups safely instead of indexing an absent result.
- [ ] Verify that summary totals, category totals, and time-series totals agree
      for the same user and period.

Acceptance: tests cover end-day transactions, exact boundaries, empty periods,
month ends, leap years, daylight-saving changes, zero baselines, and category
deletion. Adjacent periods neither overlap nor omit transactions.

### Money and currency

- [ ] Choose integer minor units or validated decimal strings for authoritative
      money handling; avoid parsing through JavaScript floating-point numbers.
- [ ] Define database decimal precision/scale if retaining Decimal storage.
- [ ] Keep authoritative sums and comparisons exact; convert only where needed
      for presentation/chart libraries.
- [ ] Explicitly define the product as EUR-only or implement a consistent currency
      model. Remove unused currency scaffolding if choosing EUR-only.
- [ ] Centralize currency formatting and document rounding rules.
- [ ] Make currency input behavior clear for decimal separators and pasted values;
      avoid silently transforming ambiguous input into a different amount.

### Budget semantics

- [ ] Define and store a budget period policy: monthly, weekly, or custom dates.
- [ ] Apply the same period semantics to dashboard and report budget comparisons.
- [ ] Replace budget category relationships on edit rather than only connecting
      newly selected categories.
- [ ] Define behavior for overlapping budget categories and deleted categories.
- [ ] Display spent, remaining, and overspent amounts clearly.

Acceptance: removing a category from a budget actually removes it, and a budget
limit is always compared against spending for its intended period.

## P1 — Reproducibility, reliability, and tests

### Setup and deployment

- [ ] Diagnose the failed production build in a clean dependency environment;
      capture actionable errors before attributing failures to application code.
- [ ] Resolve missing type definitions and verify strict type checking from a
      fresh frozen installation.
- [ ] Declare all tools used by scripts, including a pinned project dependency
      for the TypeScript seed runner; replace `npx` with pnpm-based execution.
- [ ] Document Prisma client/TypedSQL generation prerequisites and when database
      access is needed.
- [ ] Separate deployment responsibilities for migrations, generation, seeding,
      and application building; avoid incidental production data writes on builds.
- [ ] Replace asynchronous `forEach` seeding with properly awaited operations.
- [ ] Avoid fixed serial IDs in seeds or advance the sequence safely; verify that
      creating a normal category after seeding cannot collide.
- [ ] Make seeds repeatable and safe for their intended environment; keep demo
      data out of real user accounts.
- [ ] Verify both empty-database migrations and upgrade migrations against
      representative existing data.
- [ ] Document the actual supported deployment path and configuration.

### Application behavior

- [ ] Activate pending state for transaction and budget submissions; prevent
      accidental duplicate submissions and use idempotency where appropriate.
- [ ] Return consistent, typed mutation results and show actionable user-facing
      errors instead of only logging failures.
- [ ] Handle expired sessions during mutations and recover gracefully.
- [ ] Validate pagination as positive bounded integers and handle out-of-range
      pages, including after deleting the last record on a page.
- [ ] Do not initialize edit/delete dialogs with undefined selected records.
- [ ] Add deterministic pagination ordering with a stable tie-breaker.
- [ ] Fix React hook dependency warnings in date range and pagination components.
- [ ] Check that all affected views refresh after mutations and show current data.
- [ ] Remove stray debug logs and correct visible spelling/empty-state copy.
- [ ] Use structured operational logging without financial details or credentials.

### Test coverage and CI

- [ ] Add focused database integration tests for two-user isolation and server
      validation, exercising real queries rather than only mocks.
- [ ] Add regression tests for reporting arithmetic, money precision, date
      boundaries, uncategorized spending, and budget category replacement.
- [ ] Test seed completion, repeatability, and subsequent normal inserts.
- [ ] Add a browser smoke test: create, edit, report on, and delete a transaction.
- [ ] Add CI with frozen pnpm installation, Prisma generation, lint, type checking,
      meaningful tests, and a production build using an isolated test database.
- [ ] Migrate from deprecated `next lint` to the ESLint CLI as required by the
      selected Next.js version.

Acceptance: a fresh checkout and isolated database can pass the documented checks
without hidden local state or manually installed dependencies.

## P2 — Performance and operations

- [ ] Measure representative dashboard/list/report queries before optimizing.
- [ ] Add suitable ownership/date indexes, starting with evaluating a transaction
      index on `(userId, timestamp)` and indexes for other frequent owner filters.
- [ ] Verify improvements with query plans and realistic data volume.
- [ ] Run independent dashboard/report queries concurrently where appropriate;
      avoid repeated work within a request.
- [ ] Verify deployment connection pooling and database connection limits.
- [ ] Add error monitoring and basic service/database health visibility.
- [ ] Document backup frequency, retention, access, and recovery expectations.
- [ ] Perform and document a backup restore into an isolated environment.
- [ ] Verify deployed HTTPS, cookies, OAuth callback configuration, and applicable
      security headers; distinguish deployment protections from repository defaults.
- [ ] Document what sensitive data and OAuth tokens are stored, who can access
      them, and how retention/deletion work; minimize unnecessary stored tokens.

## P2 — Product features, in recommended order

### 1. CSV import — flagship feature

- [ ] Support column mapping and explicit date/decimal format selection.
- [ ] Add bounded upload/row sizes, server validation, and row-level error reports.
- [ ] Preview transactions before saving and allow users to cancel safely.
- [ ] Implement duplicate detection with documented matching rules.
- [ ] Make retries idempotent and define atomic versus partial import behavior.
- [ ] Provide a useful import summary and downloadable error details if appropriate.
- [ ] Test malformed files, duplicate imports, conflicting rows, and rollback.

Acceptance: a user can import a realistic transaction history, understand rejected
rows, and retry without accidentally duplicating spending.

### 2. Monthly budgets and overspending indicators

- [ ] Finish the budget-period correctness work above.
- [ ] Add clear period selection, budget progress, and overspending feedback.

### 3. Transaction search and filtering

- [ ] Add name search, date range, category, transaction type, and amount filters.
- [ ] Support approved sorting and preserve filters in URLs and pagination.
- [ ] Keep list counts and totals consistent with active filters and ownership.
- [ ] Test combined filters and empty results.

### 4. Recurring transactions

- [ ] Model recurrence rules, timezone, start/end dates, and next occurrence.
- [ ] Define monthly behavior for dates such as the 29th–31st.
- [ ] Implement retry-safe scheduling with an occurrence uniqueness constraint.
- [ ] Allow users to pause, edit, and cancel recurring entries.
- [ ] Test missed runs, retries, concurrent runs, and daylight-saving boundaries.

### 5. Data export and account deletion

- [ ] Export the authenticated user's data in a documented portable format.
- [ ] Protect spreadsheet-oriented exports against formula injection.
- [ ] Add a deliberate account deletion flow with clear consequences.
- [ ] Verify related financial/account data deletion and session invalidation.
- [ ] Document backup retention implications for deleted data.

### 6. Isolated demo mode

- [ ] Provide realistic fictional sample data with meaningful reports and budgets.
- [ ] Let reviewers explore without connecting their own OAuth account if feasible.
- [ ] Isolate demo data/sessions and provide a reliable reset strategy.
- [ ] Ensure demo changes cannot affect real accounts or leak secrets.

## P2 — UX, accessibility, and portfolio presentation

- [ ] Review mobile transaction/budget layouts and navigation with realistic data.
- [ ] Verify keyboard navigation, focus visibility/restoration, dialog behavior,
      labels, screen-reader announcements, and chart accessibility.
- [ ] Ensure collapsed mobile navigation is not accidentally keyboard-focusable;
      support appropriate expanded state and dismissal behavior.
- [ ] Provide useful loading, empty, error, and success states throughout.
- [ ] Replace the template README with product purpose, scope, screenshots, demo,
      pnpm setup, environment configuration, migrations, and verification commands.
- [ ] Explain architecture and key decisions: ownership, validation, money,
      reporting dates, budgets, imports, and deployment.
- [ ] Describe the thesis contribution, constraints, tradeoffs, and known limits.
- [ ] Add a concise modernization case study with before/after evidence and
      measured claims; do not claim production readiness before meeting the gates.
- [ ] Write an accurate CV entry reflecting completed work and outcomes.

## Later — Deliberately deferred scope

- [ ] Consider accounts and transfers only after the core is trustworthy; define
      balances and exclude transfers from income/expense totals.
- [ ] Reassess bank integrations, investments, household collaboration, and AI
      features only after validating demand and their added security obligations.
- [ ] Retain the single-application architecture unless measured needs justify
      additional services.

## Release / CV demonstration gates

- [ ] All P0 security items complete with regression tests.
- [ ] Financial summaries reconcile for the same user and reporting period.
- [ ] Fresh setup, migrations, seeds, and production build pass in CI using pnpm.
- [ ] No unresolved dependency finding without a documented exposure assessment.
- [ ] Demo works on mobile and with keyboard navigation, with useful sample data.
- [ ] At least one complete, useful feature beyond manual CRUD, preferably CSV
      import, is implemented and tested.
- [ ] README and thesis case study let a reviewer evaluate the work quickly.
- [ ] Monitoring and backup restoration are verified before accepting real users.
