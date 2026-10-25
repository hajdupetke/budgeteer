import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Never fall back to the application database. Use a separate, migrated *_test database.
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith('_test')) {
  throw new Error('Set TEST_DATABASE_URL to a dedicated database whose name ends in _test.');
}
process.env.DATABASE_URL = testUrl;

const session = vi.hoisted(() => ({ id: undefined as string | undefined }));
vi.mock('../src/lib/auth', () => ({
  auth: async () => session.id ? { user: { id: session.id } } : null,
  signOut: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { db } = await import('../src/lib/db');
const actions = await import('../src/lib/actions');
const { revalidatePath } = await import('next/cache');

const tag = randomUUID();
const alice = `alice-${tag}`;
const bob = `bob-${tag}`;
let shared: number;
let own: number;
let foreign: number;
let transactionId: number;
let budgetId: number;
const range = { startDate: '2024-02-01', endDate: '2024-02-29' };

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function transaction(categoryId: number | null = own, amount = '12.34') {
  return form({ name: 'Lunch', amount, categoryId: categoryId?.toString() ?? '', timestamp: '2024-02-29T23:59:59.999Z', transactionType: 'EXPENSE' });
}
function budget(ids = [own]) {
  return form({ name: 'Food', max: '100.00', categoryIds: JSON.stringify(ids) });
}
function category() { return form({ name: 'Food', icon: '🍎' }); }

beforeAll(async () => {
  await db.user.createMany({ data: [{ id: alice, email: `${alice}@example.test` }, { id: bob, email: `${bob}@example.test` }] });
  shared = (await db.transactionCategory.create({ data: { name: `Shared ${tag}`, icon: '🍎' } })).id;
});
beforeEach(async () => {
  session.id = alice;
  vi.mocked(revalidatePath).mockClear();
  await db.transaction.deleteMany({ where: { userId: { in: [alice, bob] } } });
  await db.budget.deleteMany({ where: { userId: { in: [alice, bob] } } });
  await db.transactionCategory.deleteMany({ where: { userId: { in: [alice, bob] } } });
  own = (await db.transactionCategory.create({ data: { name: 'Alice food', icon: '🍎', userId: alice } })).id;
  foreign = (await db.transactionCategory.create({ data: { name: 'Bob food', icon: '🍎', userId: bob } })).id;
  transactionId = (await db.transaction.create({ data: { name: 'Bob lunch', amount: '99', timestamp: new Date('2024-02-15T12:00:00Z'), userId: bob, categoryId: foreign, type: 'EXPENSE' } })).id;
  budgetId = (await db.budget.create({ data: { name: 'Bob budget', max: '100', userId: bob, categories: { connect: { id: foreign } } } })).id;
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [alice, bob] } } });
  if (shared) await db.transactionCategory.deleteMany({ where: { id: shared } });
  await db.$disconnect();
});

describe('ownership and visibility', () => {
  it('blocks cross-user updates and deletes without changing owners or data', async () => {
    for (const result of [
      await actions.updateTransaction(transaction(), transactionId), await actions.deleteTransaction(transactionId),
      await actions.updateBudget(budget(), budgetId), await actions.deleteBudget(budgetId),
      await actions.updateTransactionCategory(category(), foreign), await actions.deleteTransactionCategory(foreign),
    ]) expect(result.success).toBe(false);
    expect(await db.transaction.findUnique({ where: { id: transactionId } })).toMatchObject({ userId: bob, name: 'Bob lunch' });
    expect(await db.budget.findUnique({ where: { id: budgetId } })).toMatchObject({ userId: bob, name: 'Bob budget' });
    expect(await db.transactionCategory.findUnique({ where: { id: foreign } })).toMatchObject({ userId: bob, name: 'Bob food' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it('permits default categories for selection, but protects them from mutations', async () => {
    expect((await actions.getCategories()).map((item) => item.id)).toEqual(expect.arrayContaining([own, shared]));
    expect((await actions.getCategories()).map((item) => item.id)).not.toContain(foreign);
    expect((await actions.getCategories({ ownedOnly: true })).map((item) => item.id)).toEqual([own]);
    expect(await actions.getCategoryCount({ ownedOnly: true })).toBe(1);
    expect(await actions.getCategoryCount()).toBe((await actions.getCategories()).length);
    expect((await actions.updateTransactionCategory(category(), shared)).success).toBe(false);
    expect((await actions.deleteTransactionCategory(shared)).success).toBe(false);
    expect((await actions.createTransaction(transaction(shared))).success).toBe(true);
    expect((await actions.createBudget(budget([shared]))).success).toBe(true);
  });
  it('rejects foreign and nonexistent linked categories atomically', async () => {
    expect((await actions.createTransaction(transaction(foreign))).success).toBe(false);
    expect((await actions.createBudget(budget([own, foreign]))).success).toBe(false);
    expect((await actions.createBudget(budget([2147483647]))).success).toBe(false);
    expect(await actions.getTransactionCount()).toBe(0);
    expect(await actions.getBudgetCount()).toBe(0);
    await actions.createBudget(budget());
    const created = (await actions.getBudgets())[0];
    expect((await actions.updateBudget(budget([own, foreign]), created.id)).success).toBe(false);
    expect((await actions.getBudgets())[0].categories.map((item) => item.id)).toEqual([own]);
    await actions.createTransaction(transaction());
    const ownedTransaction = (await actions.getTransactions())[0];
    expect((await actions.updateTransaction(transaction(foreign), ownedTransaction.id)).success).toBe(false);
    expect((await actions.getTransactions())[0].categoryId).toBe(own);
  });
  it('ignores injected Prisma options and scopes all reads/counts to the current user', async () => {
    // Simulate untyped callers bypassing TypeScript; arbitrary options cannot replace visibility rules.
    const injected = { where: { userId: bob }, include: { user: true } };
    expect(await actions.getTransactions(injected as never)).toEqual([]);
    expect(await actions.getBudgets(injected as never)).toEqual([]);
    expect(await actions.getTransactionCount(injected as never)).toBe(0);
    expect(await actions.getBudgetCount()).toBe(0);
    expect((await actions.getCategories(injected as never)).map((item) => item.id)).not.toContain(foreign);
    expect(await actions.getCategoryCount(injected as never)).toBe((await actions.getCategories()).length);
    expect((await actions.getExpense(range))._sum.amount).toBeNull();
    expect((await actions.getIncome(range))._sum.amount).toBeNull();
    expect(await actions.getExpensesByCategory(range)).toEqual([]);
    expect(await actions.getExpenseVsIncome('day', range)).toEqual([]);
    session.id = bob;
    expect(await actions.getTransactionCount()).toBe(1);
    expect(await actions.getBudgetCount()).toBe(1);
    expect((await actions.getTransactions())[0].id).toBe(transactionId);
  });
  it('rejects unauthenticated reads and every mutation', async () => {
    session.id = undefined;
    for (const result of [
      await actions.createTransactionCategory(category()), await actions.updateTransactionCategory(category(), own), await actions.deleteTransactionCategory(own),
      await actions.createTransaction(transaction()), await actions.updateTransaction(transaction(), transactionId), await actions.deleteTransaction(transactionId),
      await actions.createBudget(budget()), await actions.updateBudget(budget(), budgetId), await actions.deleteBudget(budgetId),
    ]) expect(result).toEqual({ success: false, message: 'Please sign in to continue.' });
    for (const read of [actions.getTransactions, actions.getTransactionCount, actions.getCategories, actions.getCategoryCount, actions.getBudgets, actions.getBudgetCount, actions.getIncome, actions.getExpense, actions.getExpensesByCategory]) {
      await expect(read()).rejects.toThrow('Please sign in');
    }
    await expect(actions.getExpenseVsIncome('day')).rejects.toThrow('Please sign in');
  });
});

describe('mutation behavior', () => {
  it('supports normal CRUD and invalidates all financial pages after a write', async () => {
    expect(await actions.createTransactionCategory(category())).toEqual({ success: true });
    const created = (await actions.getCategories({ ownedOnly: true }))[0];
    expect(await actions.updateTransactionCategory(form({ name: 'Groceries', icon: '🍎' }), created.id)).toEqual({ success: true });
    expect(await actions.createTransaction(transaction(created.id))).toEqual({ success: true });
    const item = (await actions.getTransactions())[0];
    expect(await actions.updateTransaction(transaction(shared, '0.01'), item.id)).toEqual({ success: true });
    expect((await actions.getTransactions())[0].amount.toString()).toBe('0.01');
    expect(await actions.deleteTransaction(item.id)).toEqual({ success: true });
    expect(await actions.deleteTransactionCategory(created.id)).toEqual({ success: true });
    expect(await actions.createBudget(budget())).toEqual({ success: true });
    expect(await actions.deleteBudget((await actions.getBudgets())[0].id)).toEqual({ success: true });
    for (const path of ['/transactions', '/budgets', '/dashboard', '/reports']) expect(revalidatePath).toHaveBeenCalledWith(path);
  });
  it('replaces budget associations and counts shared spending in overlapping budgets', async () => {
    expect((await actions.createBudget(budget([own, shared]))).success).toBe(true);
    const id = (await actions.getBudgets())[0].id;
    expect((await actions.updateBudget(budget([shared]), id)).success).toBe(true);
    expect((await actions.getBudgets())[0].categories.map((item) => item.id)).toEqual([shared]);
    await actions.createBudget(budget([shared]));
    await actions.createTransaction(transaction(shared, '0.10'));
    await actions.createTransaction(transaction(shared, '0.20'));
    const spending = await actions.getBudgetWithAmount(await actions.getExpensesByCategory(range));
    expect(spending.map((item) => item.amount)).toEqual([0.3, 0.3]);
  });
  it('supports clearing categories and preserves transactions after category deletion', async () => {
    await actions.createTransaction(transaction());
    const id = (await actions.getTransactions())[0].id;
    expect((await actions.updateTransaction(transaction(null), id)).success).toBe(true);
    expect((await actions.getTransactions())[0]).toMatchObject({ categoryId: null, category: null });
    await actions.createTransaction(transaction());
    await actions.createBudget(budget([own, shared]));
    expect((await actions.deleteTransactionCategory(own)).success).toBe(true);
    expect((await actions.getTransactions()).every((item) => item.categoryId === null)).toBe(true);
    expect((await actions.getExpensesByCategory(range))[0]).toMatchObject({ categoryId: null });
    expect((await actions.getExpense(range))._sum.amount?.toString()).toBe('24.68');
    expect((await actions.getBudgets())[0].categories.map((item) => item.id)).toEqual([shared]);
  });
  it('rejects invalid submissions without writing, and preserves decimal precision', async () => {
    expect((await actions.createBudget(form({ name: 'Food', max: '100', categoryIds: '{' }))).success).toBe(false);
    expect((await actions.createTransaction(new FormData())).success).toBe(false);
    expect((await actions.createTransaction(transaction(null, '-12'))).success).toBe(false);
    expect((await actions.createTransaction(transaction(null, '1.001'))).success).toBe(false);
    expect((await actions.deleteTransaction(-1)).success).toBe(false);
    expect(await actions.getTransactionCount()).toBe(0);
    expect((await actions.createTransaction(transaction(null, '9007199254740993.01'))).success).toBe(true);
    expect((await actions.getTransactions())[0].amount.toString()).toBe('9007199254740993.01');
  });
});

describe('date boundaries and stable pagination', () => {
  it('uses the same inclusive calendar range for counts, aggregates, category spending, and SQL', async () => {
    for (const [timestamp, amount, type] of [
      ['2024-01-31T23:59:59.999Z', '500', 'EXPENSE'],
      ['2024-02-01T00:00:00.000Z', '1.10', 'EXPENSE'],
      ['2024-02-29T23:59:59.999Z', '2.20', 'EXPENSE'],
      ['2024-02-29T23:59:59.999Z', '10.00', 'INCOME'],
      ['2024-03-01T00:00:00.000Z', '500', 'EXPENSE'],
    ] as const) await db.transaction.create({ data: { name: 'Boundary', timestamp: new Date(timestamp), amount, type, userId: alice } });
    expect(await actions.getTransactionCount(range)).toBe(3);
    expect((await actions.getExpense(range))._sum.amount?.toString()).toBe('3.3');
    expect((await actions.getIncome(range))._sum.amount?.toString()).toBe('10');
    expect((await actions.getExpensesByCategory(range))[0]._sum.amount?.toString()).toBe('3.3');
    const rows = await actions.getExpenseVsIncome('day', range);
    expect(rows.map((item) => item.period)).toEqual(['2024-02-01T00:00:00.000Z', '2024-02-29T00:00:00.000Z']);
    expect(rows.reduce((sum, item) => sum + item.totalExpense, 0)).toBeCloseTo(3.3);
    expect(rows.reduce((sum, item) => sum + item.totalIncome, 0)).toBe(10);
    expect(await actions.getTransactionCount({ startDate: '2024-02-29' })).toBe(2);
    await expect(actions.getTransactionCount({ startDate: '2024-02-30' })).rejects.toThrow();
    await expect(actions.getExpenseVsIncome('invalid' as never, range)).rejects.toThrow();
  });
  it('keeps rows with identical timestamps on stable pages and handles empty results', async () => {
    for (let i = 0; i < 7; i++) await actions.createTransaction(transaction());
    const first = await actions.getTransactions({ skip: 0, take: 6 });
    const second = await actions.getTransactions({ skip: 6, take: 6 });
    expect(first.map((item) => item.id)).toEqual([...first.map((item) => item.id)].sort((a, b) => b - a));
    expect(second).toHaveLength(1);
    expect(first.map((item) => item.id)).not.toContain(second[0].id);
    await actions.deleteTransaction(second[0].id);
    expect(await actions.getTransactions({ skip: 6, take: 6 })).toEqual([]);
    await expect(actions.getTransactions({ skip: -1 })).rejects.toThrow();
    await expect(actions.getBudgets({ take: 0 })).rejects.toThrow();
  });
});
