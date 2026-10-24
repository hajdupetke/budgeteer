# Repository Guidelines

## Project Structure & Module Organization
Budgeteer is a Next.js 15 App Router application using React 19, TypeScript, Tailwind CSS 4, and PostgreSQL through Prisma.

- `src/app/`: routes, layouts, and global styles. Route groups separate authenticated pages (dashboard, budgets, transactions, reports) from sign-in and landing pages.
- Route-local `_components/`: feature-specific UI; `src/components/ui/`: reusable controls and charts.
- `src/lib/`: server actions, authentication, database access, utilities, and Zod validation; `src/types/`: shared domain types.
- `prisma/`: schema, migrations, seed script, and typed SQL queries; `public/`: static assets.

## Build, Test, and Development Commands
Use pnpm for dependency management and project commands.

- `pnpm install --frozen-lockfile`: install dependencies from `pnpm-lock.yaml`.
- `docker compose up -d db`: start the local PostgreSQL 16 service.
- `pnpm exec prisma migrate dev`: apply development migrations; supply `--name descriptive_name` when creating one.
- `pnpm exec prisma generate --sql`: generate the Prisma client and typed SQL bindings against the configured database.
- `pnpm run dev`: start the Turbopack development server at `http://localhost:3000`.
- `pnpm run build`: create a production build; `pnpm start`: serve it.
- `pnpm run lint`: run the configured Next.js ESLint checks.
- `pnpm exec tsc --noEmit`: check TypeScript types.

`pnpm run vercel-build` also deploys migrations and runs the seed script; use it only against an intended deployment database.

## Coding Style & Naming Conventions
Follow surrounding code: two-space indentation, semicolons, single-quoted TypeScript strings, and double-quoted JSX attributes. Use PascalCase for feature components, camelCase for functions and variables, and Next.js filenames such as `page.tsx`, `layout.tsx`, and `route.ts`. Import shared modules through `@/`. Keep validation in Zod schemas and database access in server code. ESLint extends Next.js Core Web Vitals and TypeScript rules; no dedicated formatter is configured.

## Testing Guidelines
No automated test framework, test script, or coverage threshold is configured. Run lint, type checking, and a production build, then manually exercise affected flows. For financial changes, check totals, date ranges, nullable categories, and user-specific data access. Document verification steps in the pull request.

## Commit & Pull Request Guidelines
Recent history commonly uses `fix:` and `feat:` prefixes. Write concise, specific subjects, such as `fix: preserve transactions when deleting categories`. Pull requests should explain the behavior change, link relevant issues, list verification results, and include screenshots for UI changes. Call out migrations and configuration requirements.

## Security & Configuration
Copy `.env.example` to `.env` and configure `DATABASE_URL`, `AUTH_SECRET`, and OAuth credentials. Never commit secrets. Docker Compose credentials are for local development.
