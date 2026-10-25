# Budgeteer: CV Readiness TODO

## 1. Fix correctness and access control

- [x] **Enforce record ownership in server actions.** In `src/lib/actions.ts`, scope transaction, budget, and category updates/deletes to the authenticated user. Validate ownership of linked categories; shared default categories should be selectable but not editable or deletable by ordinary users. Verify with two separate accounts.
- [x] **Make query scoping unavoidable.** Count helpers currently accept unscoped queries, and `...dbOptions` can overwrite ownership filters in read helpers. Replace unrestricted options with a small typed interface and always apply user visibility rules internally. Dashboard/report empty states must reflect only the current user's data.
- [x] **Validate mutations on the server.** Reuse the Zod schemas for names, positive amounts, dates, transaction types, category IDs, and budget selections. Handle malformed JSON and missing form fields with useful errors.
- [x] **Fix dashboard comparisons.** Replace the current ratio with `(current - previous) / previous * 100`; handle a zero baseline and missing totals. Use zero instead of blank amounts and correct the up/down wording.
- [x] **Make date ranges consistent.** Align report aggregates and `prisma/sql/incomeExpense.sql`: the SQL currently truncates the end date to midnight. Define inclusive calendar-day selection with an exclusive next-day boundary, validate URL dates, support clearing the picker, and order chart periods chronologically.
- [x] **Fix budget editing.** Replace category associations rather than only calling `connect`, so deselected categories are removed. Reset form values and multiselect state when switching the budget being edited.
- [x] **Handle uncategorized transactions consistently.** The schema allows missing categories, but mutations always connect one and charts assume a matching category exists. Support a clear “Uncategorized” fallback across forms, lists, and reports, including after category deletion.
- [x] **Harden pagination.** Validate positive integer page parameters, use stable ordering, handle empty results, and recover after deleting the final item on a page. Avoid initializing edit dialogs with an undefined selection.
- [x] **Define simple financial rules.** Keep EUR as the documented currency and centralize `Intl.NumberFormat` formatting. Validate monetary precision without unnecessary floating-point round trips. Choose and label one default budget/dashboard period; explain that overlapping category budgets can share spending.

## 2. Refresh the core app design

- [ ] **Establish a small visual baseline.** Reuse existing Tailwind/Radix components; standardize spacing, typography, card headers, button hierarchy, and semantic colors. Fix inconsistent utility classes rather than introducing another UI framework.
- [ ] **Redesign the dashboard hierarchy.** Put income, expenses, and net balance first, followed by budget progress and supporting charts. Show the reporting period prominently, sensible empty states, and an obvious “Add transaction” action.
- [ ] **Improve transactions and category management.** Make transactions the primary content; move categories into a secondary section or dialog. Use a readable desktop table and compact mobile rows, with aligned amounts and predictable edit/delete controls.
- [ ] **Improve budget and report presentation.** Show spent, remaining, and over-budget amounts clearly. Add useful chart legends/tooltips, stable category colors beyond the current palette, and empty states for individual charts. Keep report controls readable on small screens.
- [ ] **Polish the app shell and accessibility.** Check narrow-screen overflow, long names, dialogs, and sign-in buttons. Make mobile navigation close after selection, support Escape and keyboard focus, provide labels and visible focus states, and avoid communicating status through color alone.
- [ ] **Finish interaction states and copy.** Set pending state before submissions, prevent duplicate writes, show actionable failures instead of console-only errors, and preserve form values on failure. Add lightweight loading/error boundaries and correct spelling, placeholders, and broken empty-state sentences.

## 3. Make setup and the demo dependable

- [ ] **Complete the repository's pnpm migration.** Only `AGENTS.md` has been updated so far. Pin the package manager, generate and commit `pnpm-lock.yaml`, replace `package-lock.json`, and update README/build scripts. Install `tsx` locally instead of downloading it through `npx` during deployment.
- [ ] **Establish working checks before upgrades.** Verify install, Prisma generation, lint, typecheck, and build from a clean checkout. Resolve the ESLint 9/legacy configuration and `next lint` compatibility; add explicit scripts for checks and database setup.
- [ ] **Review dependency maintenance.** Check framework/authentication security advisories when implementing this task, apply supported fixes, and remove verified unused packages. Upgrade major versions only where needed; retest OAuth, forms, and charts afterward.
- [ ] **Fix and separate seeding.** Await category upserts in `prisma/seed.ts` instead of using async `forEach`; ensure repeated runs succeed and generated category IDs cannot collide with seeded IDs. Separate demo seeding from ordinary production builds.
- [ ] **Provide a recruiter-friendly demo.** Add fictional income, expenses, and budgets across recent months using relative dates. Offer an isolated demo session or read-only preview without requiring a personal OAuth login; keep demo data separate from real accounts.
- [ ] **Verify one hosted deployment.** Test OAuth callback URLs, logout, refreshes, migrations, and image loading. Restrict remote profile image hosts to the providers actually used, correct the example authentication-secret placeholder, and document required environment variables.

## 4. Add focused evidence of quality

- [ ] **Test the important regressions.** Add a small suite for server validation, percentage calculations, and date boundaries, plus database integration checks for cross-user access and budget category replacement. Use a dedicated test database; no arbitrary coverage target.
- [ ] **Automate the basic checks.** Add a simple CI workflow using pinned pnpm, lint, typecheck, and the focused tests. Include a build only with the database/configuration needed for Prisma typed SQL generation.
- [ ] **Run one complete acceptance pass.** Cover new-user onboarding, CRUD, category deletion, reports, pagination, empty data, failed submissions, and mobile keyboard navigation. Record results; automate one main browser flow if it adds useful confidence.
- [ ] **Tidy touched code.** Remove debug logs and replace broad `any` types around query results, currency fields, and category selection. Extract duplicated report mapping/formatting where useful; keep refactoring proportional to the fixes.

## 5. Package the project for the CV

- [ ] **Refresh the landing/sign-in pages after the app redesign.** Use accurate product copy, updated screenshots, a clear demo CTA, and links to source code and the thesis/project write-up. Review metadata, favicon, social preview, image loading, and mobile layout.
- [ ] **Replace the starter README.** Include a live demo link, screenshots, project purpose, thesis context, stack, reproducible pnpm/database/OAuth setup, checks, and known limitations. Add a short architecture/data-model explanation and two or three concrete technical decisions.
- [ ] **Explain your contribution and progress.** Separate the original thesis scope from later improvements, credit borrowed components/assets, and choose an appropriate license before presenting the repository as reusable open source.
- [ ] **Capture the final presentation.** Add desktop/mobile screenshots and a short walkthrough showing transaction creation, budget feedback, and reports. Prepare a concise CV description using demonstrated features and measured results only.

## Optional after the essentials

- [ ] Add basic transaction search and category/type filtering if the demo dataset makes browsing cumbersome.
- [ ] Add CSV export if a small, finished feature would strengthen the project story.

Defer bank integrations, recurring payments, multi-currency conversion, microservices, elaborate role systems, and extensive monitoring. Completion means a reviewer can open the demo, understand the app, try its main flow, and find clear evidence that the important calculations and access rules work.
