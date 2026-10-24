import { randomUUID } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { CurrencyInput } from '@/components/ui/currency-input';
import { renderReadSection } from '@/components/read-boundary';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { Prisma, PrismaClient } from '@prisma/client';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth, signOut: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('server-only', () => ({}));

import { db } from '@/lib/db';
import * as actions from '@/lib/actions';
import * as data from '@/lib/data';
import { defaultReportRange, DateRangeSchema, parseReportDateRange, shiftUtcYears } from '@/lib/validation';
import { ReadError, runReadQuery } from '@/lib/read-query';
import { applyFieldErrors } from '@/lib/form-errors';

if (!process.env.TEST_DATABASE_URL || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) throw new Error('Use the isolated integration-test runner.');
const userId = randomUUID();
const otherId = randomUUID();
let categoryId: number;
let transactionId: number;
let budgetId: number;
const transactionDate = new Date(Date.now() - 86400000).toISOString();
const form = (values: Record<string, string>) => {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
};
const categoryForm = () => form({ name: 'Valid category', icon: '🌱' });
const transactionForm = () => form({ name: 'Valid transaction', amount: '12.34', categoryId: String(categoryId), timestamp: transactionDate, transactionType: 'EXPENSE' });
const budgetForm = () => form({ name: 'Valid budget', max: '123.45', categoryIds: JSON.stringify([categoryId]) });

beforeAll(async () => {
  await db.user.createMany({ data: [userId, otherId].map((id) => ({ id, email: `${id}@validation.test` })) });
});
beforeEach(async () => {
  await db.transaction.deleteMany({ where: { userId } });
  await db.budget.deleteMany({ where: { userId } });
  await db.transactionCategory.deleteMany({ where: { userId: { in: [userId, otherId] } } });
  categoryId = (await db.transactionCategory.create({ data: { userId, name: 'Original category', icon: '🌱' } })).id;
  transactionId = (await db.transaction.create({ data: { userId, name: 'Original transaction', amount: '10', timestamp: new Date(transactionDate), categoryId } })).id;
  budgetId = (await db.budget.create({ data: { userId, name: 'Original budget', max: '100', categories: { connect: { id: categoryId } } } })).id;
  mocks.auth.mockResolvedValue({ user: { id: userId } });
  mocks.revalidatePath.mockReset();
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await db.$disconnect();
});
const snapshot = async () => ({
  transactions: await db.transaction.findMany({ where: { userId }, orderBy: { id: 'asc' } }),
  budgets: await db.budget.findMany({ where: { userId }, include: { categories: true }, orderBy: { id: 'asc' } }),
  categories: await db.transactionCategory.findMany({ where: { userId }, orderBy: { id: 'asc' } }),
});
const invalid = { success: false, error: { code: 'INVALID_INPUT' } };

it.each(['name', 'icon'] as const)('validates category %s on create and edit without partial writes', async (field) => {
  const before = await snapshot();
  for (const value of ['', '   ', field === 'name' ? 'ab' : 'x'.repeat(33), 'x'.repeat(51)]) {
    const input = categoryForm(); input.set(field, value);
    for (const call of [() => actions.createTransactionCategory(input), () => actions.updateTransactionCategory(input, categoryId)]) {
      expect(await call()).toMatchObject({ ...invalid, error: { code: 'INVALID_INPUT', fieldErrors: { [field]: expect.any(Array) } } });
    }
  }
  expect(await snapshot()).toEqual(before);
  expect(mocks.revalidatePath).not.toHaveBeenCalled();
});

it.each(['name', 'amount', 'categoryId', 'timestamp', 'transactionType'] as const)('rejects invalid transaction %s on create and edit', async (field) => {
  const values = {
    name: ['', '  ', 'ab', 'x'.repeat(51)],
    amount: ['0', '-1', 'NaN', 'Infinity', '1e3', '12abc', '1,23', '1.234', '1000000000', '0.001', '+1', '.5'],
    categoryId: ['0', '-1', '1.5', '1e2', '0x10', '2147483648'],
    timestamp: ['bad', '1899-12-31T23:59:59Z', '2999-01-01T00:00:00Z', '2025-02-30T00:00:00Z', '2025-01-01'],
    transactionType: ['', 'TRANSFER', 'expense'],
  };
  const before = await snapshot();
  for (const value of values[field]) {
    const input = transactionForm(); input.set(field, value);
    expect(await actions.createTransaction(input)).toMatchObject(invalid);
    expect(await actions.updateTransaction(input, transactionId)).toMatchObject(invalid);
  }
  expect(await snapshot()).toEqual(before);
  expect(mocks.revalidatePath).not.toHaveBeenCalled();
});

it('rejects malformed form objects, missing fields, files, and duplicate known fields', async () => {
  const before = await snapshot();
  for (const [make, create, update] of [
    [categoryForm, actions.createTransactionCategory, (input: FormData) => actions.updateTransactionCategory(input, categoryId)],
    [transactionForm, actions.createTransaction, (input: FormData) => actions.updateTransaction(input, transactionId)],
    [budgetForm, actions.createBudget, (input: FormData) => actions.updateBudget(input, budgetId)],
  ] as const) {
    expect(await create({} as FormData)).toMatchObject(invalid);
    for (const key of make().keys()) {
      const missing = make(); missing.delete(key);
      const file = make(); file.set(key, new File(['payload'], 'input.txt'));
      const duplicate = make(); duplicate.append(key, 'duplicate');
      for (const input of [missing, file, duplicate]) {
        expect(await create(input)).toMatchObject(invalid);
        expect(await update(input)).toMatchObject(invalid);
      }
    }
  }
  expect(await snapshot()).toEqual(before);
});

it('rejects malformed, oversized, empty, and invalid category arrays and invalid budget amounts', async () => {
  const before = await snapshot();
  for (const value of ['bad', 'null', '{}', '[]', '[1.5]', '["1"]', '[0]', ' '.repeat(4097), JSON.stringify(Array(101).fill(categoryId))]) {
    const input = budgetForm(); input.set('categoryIds', value);
    expect(await actions.createBudget(input)).toMatchObject(invalid);
    expect(await actions.updateBudget(input, budgetId)).toMatchObject(invalid);
  }
  for (const value of ['0', '-1', 'NaN', 'Infinity', '1e2', '1.234', '12abc', '1000000000', '1,20']) {
    const input = budgetForm(); input.set('max', value);
    expect(await actions.createBudget(input)).toMatchObject(invalid);
    expect(await actions.updateBudget(input, budgetId)).toMatchObject(invalid);
  }
  for (const value of ['ab', '  ', 'x'.repeat(51)]) {
    const input = budgetForm(); input.set('name', value);
    expect(await actions.createBudget(input)).toMatchObject(invalid);
    expect(await actions.updateBudget(input, budgetId)).toMatchObject(invalid);
  }
  expect(await snapshot()).toEqual(before);
});

it('stores trimmed Unicode text and exact monetary boundaries without floating-point parsing', async () => {
  const category = categoryForm(); category.set('name', '  🌱🌱🌱  '); category.set('icon', '  🌍  ');
  expect(await actions.updateTransactionCategory(category, categoryId)).toEqual({ success: true });
  expect(await db.transactionCategory.findUniqueOrThrow({ where: { id: categoryId } })).toMatchObject({ name: '🌱🌱🌱', icon: '🌍' });
  for (const amount of ['0.01', '0.1', '999999999.99']) {
    const input = transactionForm(); input.set('amount', amount); input.set('name', '  Trimmed transaction  ');
    expect(await actions.updateTransaction(input, transactionId)).toEqual({ success: true });
    const stored = await db.transaction.findUniqueOrThrow({ where: { id: transactionId } });
    expect(stored.name).toBe('Trimmed transaction');
    expect(stored.amount.toString()).toBe(new Prisma.Decimal(amount).toString());
    const budget = budgetForm(); budget.set('max', amount);
    expect(await actions.updateBudget(budget, budgetId)).toEqual({ success: true });
    expect((await db.budget.findUniqueOrThrow({ where: { id: budgetId } })).max.toString()).toBe(new Prisma.Decimal(amount).toString());
  }
  const input = budgetForm(); input.set('categoryIds', JSON.stringify(Array(100).fill(categoryId)));
  expect(await actions.updateBudget(input, budgetId)).toEqual({ success: true });
  expect((await data.getBudgets())[0].categories).toHaveLength(1);
});

it('maps server validation messages only onto allowed form fields', () => {
  const setError = vi.fn();
  applyFieldErrors<{ name: string; amount: string }>(setError, { name: ['Name is required.'], amount: ['Amount must be positive.'], userId: ['Should not be a form field.'] }, ['name', 'amount']);
  expect(setError.mock.calls).toEqual([
    ['name', { type: 'server', message: 'Name is required.' }],
    ['amount', { type: 'server', message: 'Amount must be positive.' }],
  ]);
});

it('uses clamped calendar defaults and rejects ranges beyond five years', async () => {
  const now = new Date('2024-02-29T12:34:56Z');
  expect(defaultReportRange(now)).toEqual({ start: new Date('2023-02-28T12:34:56Z'), end: now });
  const start = new Date('2020-02-29T12:00:00Z');
  const end = shiftUtcYears(start, 5);
  expect(end.toISOString()).toBe('2025-02-28T12:00:00.000Z');
  expect(DateRangeSchema.safeParse({ start, end }).success).toBe(true);
  expect(DateRangeSchema.safeParse({ start, end: new Date(end.getTime() + 1) }).success).toBe(false);
  await expect(data.getExpense({ range: { start, end: new Date('2026-01-01') } })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  await expect(data.getExpenseVsIncome({ step: 'day' } as never)).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  expect(parseReportDateRange(undefined, undefined).success).toBe(true);
  expect(parseReportDateRange('0000-01-01', '0000-01-02').success).toBe(false);
  await expect(data.getExpense({ range: { start: new Date('0000-01-01'), end: new Date('0000-01-02') } })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  await db.transaction.create({ data: { userId, name: 'Old transaction', amount: '50', timestamp: new Date('2000-01-01') } });
  expect(await data.getTransactionCount()).toBe(2);
  expect((await data.getIncome()).amount?.toString()).toBe('10');
});

it('rejects overflowing category options, chart budgets, and nested categories instead of truncating', async () => {
  const created = await db.transactionCategory.createManyAndReturn({
    data: Array.from({ length: 999 }, () => ({ userId, name: 'Bulk category', icon: '🌱' })), select: { id: true },
  });
  expect(await data.getCategoryOptions()).toHaveLength(1000);
  await db.transactionCategory.create({ data: { userId, name: 'Overflow category', icon: '🌱' } });
  await expect(data.getCategoryOptions()).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
  await db.transactionCategory.deleteMany({ where: { userId, id: { not: categoryId } } });
  await db.budget.createMany({ data: Array.from({ length: 1000 }, () => ({ userId, name: 'Bulk budget', max: '1' })) });
  await expect(data.getBudgetWithAmount()).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
  await db.budget.deleteMany({ where: { userId, id: { not: budgetId } } });
  const categories = await db.transactionCategory.createManyAndReturn({ data: created.slice(0, 100).map(() => ({ userId, name: 'Nested category', icon: '🌱' })), select: { id: true } });
  await db.budget.update({ where: { id: budgetId }, data: { categories: { connect: categories } } });
  await expect(data.getBudgets()).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
  await expect(data.getBudgetWithAmount()).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
});

it('bounds category aggregate groups including hidden legacy references', async () => {
  const categories = await db.transactionCategory.createManyAndReturn({ data: Array.from({ length: 1001 }, () => ({ userId: otherId, name: 'Other category', icon: '🌱' })), select: { id: true } });
  await db.transaction.createMany({ data: categories.map(({ id }) => ({ userId, name: 'Legacy link', amount: '1', timestamp: new Date(transactionDate), categoryId: id, type: 'EXPENSE' as const })) });
  await expect(data.getExpensesByCategory()).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
});

it('cancels a slow database query with a sanitized timeout and leaves the pool usable', async () => {
  await expect(runReadQuery((tx) => tx.$queryRaw`SELECT pg_sleep(6)`)).rejects.toMatchObject({ code: 'READ_TIMEOUT' });
  const [settings] = await db.$queryRaw<{ statement_timeout: string }[]>`SHOW statement_timeout`;
  expect(settings.statement_timeout).toBe('0');
  expect(await data.getTransactionCount()).toBe(1);
}, 15000);

it('rejects raw database writes that violate every persistent scalar invariant', async () => {
  for (const value of ['0', '-1', '1000000000', '0.001', 'NaN', 'Infinity']) {
    await expect(db.$executeRaw`UPDATE "Transaction" SET "amount" = CAST(${value} AS numeric) WHERE id = ${transactionId}`).rejects.toThrow();
    await expect(db.$executeRaw`UPDATE "Budget" SET "max" = CAST(${value} AS numeric) WHERE id = ${budgetId}`).rejects.toThrow();
  }
  for (const value of ['', 'ab', '  Invalid name ', '\u00a0Invalid name', 'x'.repeat(51)]) {
    await expect(db.$executeRaw`UPDATE "Transaction" SET "name" = ${value} WHERE id = ${transactionId}`).rejects.toThrow();
    await expect(db.$executeRaw`UPDATE "Budget" SET "name" = ${value} WHERE id = ${budgetId}`).rejects.toThrow();
    await expect(db.$executeRaw`UPDATE "TransactionCategory" SET "name" = ${value} WHERE id = ${categoryId}`).rejects.toThrow();
  }
  for (const value of ['', '  ', ' x ', '🌱'.repeat(33)]) {
    await expect(db.$executeRaw`UPDATE "TransactionCategory" SET "icon" = ${value} WHERE id = ${categoryId}`).rejects.toThrow();
  }
  for (const value of ['1899-12-31', 'infinity', '-infinity']) {
    await expect(db.$executeRaw`UPDATE "Transaction" SET "timestamp" = CAST(${value} AS timestamp) WHERE id = ${transactionId}`).rejects.toThrow();
  }
});

const execute = promisify(execFile);
const migration = resolve('prisma/migrations/20261024190000_validate_financial_invariants/migration.sql');
const withScratchSchema = async (test: (client: PrismaClient, url: string, schema: string) => Promise<void>) => {
  const schema = `validation_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.TEST_DATABASE_URL!); url.searchParams.set('schema', schema);
  await db.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  const client = new PrismaClient({ datasourceUrl: url.toString() });
  try {
    for (const table of ['Transaction', 'Budget', 'TransactionCategory']) {
      await db.$executeRawUnsafe(`CREATE TABLE "${schema}"."${table}" (LIKE public."${table}" INCLUDING DEFAULTS EXCLUDING CONSTRAINTS)`);
    }
    await test(client, url.toString(), schema);
  } finally {
    await client.$disconnect();
    await db.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
  }
};
const applyMigration = (url: string) => execute('pnpm', ['exec', 'prisma', 'db', 'execute', '--file', migration, '--url', url], { env: { ...process.env, DATABASE_URL: url } });

it('applies the invariant migration to an empty legacy schema', async () => {
  await withScratchSchema(async (client, url, schema) => {
    await applyMigration(url);
    const [row] = await client.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_constraint c JOIN pg_namespace n ON c.connamespace = n.oid WHERE n.nspname = ${schema} AND c.contype = 'c'`;
    expect(row.count).toBe(7);
  });
});

it('audits and refuses invalid legacy data unchanged, then upgrades valid data without rounding', async () => {
  await withScratchSchema(async (client, url, schema) => {
    await client.$executeRaw`INSERT INTO "Transaction" (id, "userId", name, amount, timestamp, "updatedAt") VALUES (1, 'fixture', 'Secret legacy name', 0, TIMESTAMP '2025-01-01', NOW())`;
    const audit = await execute('node', ['scripts/check-invariants.mjs'], { env: { ...process.env, DATABASE_URL: url } }).then((result) => ({ ...result, code: 0 }), (error) => error as { stdout: string; stderr: string; code: number });
    expect(audit.code).toBe(1);
    expect(audit.stdout).toContain('"rule":"Transaction_amount_valid","violations":"1"');
    expect(audit.stdout).not.toContain('Secret legacy name');
    await expect(applyMigration(url)).rejects.toThrow();
    expect((await client.$queryRaw<{ amount: Prisma.Decimal }[]>`SELECT amount FROM "Transaction"`)[0].amount.toString()).toBe('0');
    const [before] = await client.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_constraint c JOIN pg_namespace n ON c.connamespace = n.oid WHERE n.nspname = ${schema} AND c.contype = 'c'`;
    expect(before.count).toBe(0);
    await client.$executeRaw`UPDATE "Transaction" SET amount = 12.34`;
    await applyMigration(url);
    const auditAfter = await execute('node', ['scripts/check-invariants.mjs'], { env: { ...process.env, DATABASE_URL: url } });
    expect(auditAfter.stdout.match(/"violations":"0"/g)).toHaveLength(7);
    expect((await client.$queryRaw<{ amount: Prisma.Decimal }[]>`SELECT amount FROM "Transaction"`)[0].amount.toString()).toBe('12.34');
  });
}, 30000);


it('preserves invalid currency text for validation and renders safe read-error feedback', async () => {
  const onChange = vi.fn();
  const view = CurrencyInput({ field: { value: '-12abc', name: 'amount', onChange, onBlur: vi.fn(), ref: null }, isInvalid: true });
  expect(renderToStaticMarkup(view)).toContain('value="-12abc"');
  expect(renderToStaticMarkup(view)).toContain('aria-invalid="true"');
  view.props.children[0].props.onChange({ target: { value: '1,23' } });
  expect(onChange).toHaveBeenCalledWith('1,23');
  const message = await renderReadSection(async () => { throw new ReadError('READ_TIMEOUT', 'Choose a smaller range.'); });
  expect(renderToStaticMarkup(message)).toContain('role="alert"');
  expect(renderToStaticMarkup(message)).toContain('Choose a smaller range.');
  await expect(renderReadSection(async () => { throw new Error('Unexpected failure'); })).rejects.toThrow('Unexpected failure');
});
