import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL must explicitly identify an isolated PostgreSQL test database.');
}
const parsed = new URL(databaseUrl);
if (!['postgresql:', 'postgres:'].includes(parsed.protocol) || !decodeURIComponent(parsed.pathname).endsWith('_test')) {
  throw new Error('The isolated test database name must end in _test.');
}
if (process.env.DATABASE_URL && databaseUrl === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must differ from the application DATABASE_URL.');
}
const env = { ...process.env, DATABASE_URL: databaseUrl };
for (const args of [
  ['exec', 'prisma', 'migrate', 'deploy'],
  ['exec', 'prisma', 'generate', '--sql'],
  ['exec', 'vitest', 'run'],
]) {
  const result = spawnSync('pnpm', args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
