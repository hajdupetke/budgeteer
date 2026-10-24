import { PrismaClient } from '@prisma/client';
import { invariants } from './invariants.mjs';

if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL explicitly for the read-only audit.');
const db = new PrismaClient();
try {
  const results = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const counts = [];
    for (const { table, name, predicate } of invariants) {
      // Identifiers/predicates come only from the static invariant definitions.
      const [row] = await tx.$queryRawUnsafe(`SELECT count(*)::text AS count FROM "${table}" WHERE NOT (${predicate})`);
      counts.push({ table, rule: name, violations: row.count });
    }
    return counts;
  }, { timeout: 60000 });
  for (const result of results) console.log(JSON.stringify(result));
  if (results.some((result) => result.violations !== '0')) process.exitCode = 1;
} catch {
  console.error('Audit could not complete. Verify the database connection and schema. No repairs were performed.');
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
