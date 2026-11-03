# Repository Guidelines

## Project Structure & Module Organization

Budgeteer uses Next.js 15 App Router, React 19, TypeScript, and PostgreSQL with Prisma.

- `src/app/`: routes and layouts, grouped into `(authenticated)` and `(unauthenticated)` areas. Keep feature components in adjacent `_components/` directories.
- `src/components/ui/`: shared UI primitives and charts built with Radix UI and Tailwind CSS.
- `src/lib/`: authentication, database access, server actions, utilities, and Zod validation schemas.
- `src/types/`: shared budget, transaction, and report types.
- `prisma/`: database schema, migrations, seed data, and typed SQL queries.
- `public/`: static images and the favicon.

## Frontend Development

### Skills
- For frontend tasks, load and follow the installed `shadcn`
  and `impeccable` skills when relevant.
- Read their SKILL.md instructions before implementation.
- Use `shadcn` for component selection, implementation,
  and established UI patterns.
- Use `impeccable` for visual design, layout, typography,
  spacing, interactions, and refinement.
- For new pages or significant UI changes, use both skills.
- Do not invoke these skills for unrelated backend tasks.

### UI Guidelines
- Prefer existing shadcn/ui components over custom solutions.
- Reuse existing project components and design patterns.
- Use Tailwind CSS and existing theme tokens.
- Maintain consistent typography, spacing, colors,
  border radii, and visual hierarchy.
- Avoid generic AI-generated aesthetics and unnecessary
  visual complexity.
- Ensure responsive layouts and accessible interactions.
- Include appropriate hover, focus, loading, empty,
  and error states.

### Design Consistency
- Treat the existing application and its theme tokens
  as the source of truth for visual consistency.
- Do not introduce new colors, fonts, or component styles
  without a clear reason.
- When implementing new features, match the visual language
  of existing pages.
- Use Impeccable to refine interfaces without unnecessarily
  redesigning working components.


## Build, Test, and Development Commands

- `pnpm install`: install dependencies.
- `docker compose up -d db`: start the local PostgreSQL 16 database.
- `pnpm exec prisma migrate dev`: apply local migrations and create migrations for schema changes.
- `pnpm exec prisma generate --sql`: generate Prisma Client and typed SQL bindings against a configured database.
- `pnpm run dev`: start the Turbopack development server at `http://localhost:3000`.
- `pnpm run build` / `pnpm start`: build and serve the production application.
- `pnpm run lint`: run the configured Next.js ESLint checks.
- `pnpm exec tsc --noEmit`: check TypeScript types.

`pnpm run vercel-build` also deploys migrations and seeds the database; use it only with the intended deployment database.

## Coding Style & Naming Conventions

Follow surrounding code: two-space indentation, semicolons, and single-quoted strings where practical. TypeScript strict mode is enabled; use `@/` imports for modules under `src/`. Use PascalCase for feature components (for example, `CreateBudgetForm.tsx`), preserve lowercase names for shared UI primitives, and follow Next.js conventions such as `page.tsx` and `layout.tsx`. Reuse Zod schemas and shared UI components. ESLint extends Next.js Core Web Vitals and TypeScript rules; no standalone formatter is configured.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is currently configured. Run lint, type checks, and a production build for changes. Manually verify affected authenticated flows, form validation, and database mutations. Describe the scenarios checked in the pull request.

## Commit & Pull Request Guidelines

History commonly uses `fix:` and `feat:` prefixes. Write concise, descriptive commit subjects. Pull requests should explain the behavior change, link relevant issues, list validation performed, and include screenshots for visual changes. Call out migrations and configuration changes explicitly.

## Security & Configuration

Copy `.env.example` to `.env` and configure the database URL, authentication secret, and OAuth credentials. Keep secrets out of commits. Enforce user ownership checks in server actions that read or modify financial records.
