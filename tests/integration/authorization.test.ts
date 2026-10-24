import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth, signOut: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('server-only', () => ({}));

import { db } from '@/lib/db';
import * as actions from '@/lib/actions';
import * as data from '@/lib/data';
import { normalizePage, parseReportDateRange } from '@/lib/validation';

if (!process.env.TEST_DATABASE_URL || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
  throw new Error('Run with pnpm test:integration and an isolated TEST_DATABASE_URL.');
}

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const transactionForm = (categoryId: number) => form({
  name: 'Updated transaction', amount: '20.50', timestamp: '2026-01-01T12:00:00Z',
  transactionType: 'EXPENSE', categoryId: String(categoryId),
});
const budgetForm = (ids: number[]) => form({ name: 'Updated budget', max: '500', categoryIds: JSON.stringify(ids) });
const categoryForm = () => form({ name: 'Updated category', icon: '🌱' });
const unavailable = {
  success: false,
  error: { code: 'RECORD_UNAVAILABLE', message: 'Requested record or category is unavailable.' },
};

const userIds = [randomUUID(), randomUUID()];
const emptyUserId = randomUUID();
let sharedId: number;
let missingId: number;
let categoryIds: number[];
let transactionIds: number[];
let budgetIds: number[];
const signIn = (index: number) => mocks.auth.mockResolvedValue({ user: { id: userIds[index] } });

beforeAll(async () => {
  await db.user.createMany({ data: [...userIds, emptyUserId].map((id) => ({ id, email: `${id}@authorization.test` })) });
  await db.account.createMany({ data: userIds.map((userId) => ({
    userId, type: 'oauth', provider: 'test', providerAccountId: userId,
    access_token: 'private-access-token', refresh_token: 'private-refresh-token',
  })) });
  const shared = await db.transactionCategory.create({ data: { name: 'Shared test category', icon: '🌍' } });
  sharedId = shared.id;
  const missing = await db.transactionCategory.create({ data: { name: 'Deleted fixture', icon: '🌍' } });
  missingId = missing.id;
  await db.transactionCategory.delete({ where: { id: missingId } });
});

beforeEach(async () => {
  await db.transaction.deleteMany({ where: { userId: { in: userIds } } });
  await db.budget.deleteMany({ where: { userId: { in: userIds } } });
  await db.transactionCategory.deleteMany({ where: { userId: { in: userIds } } });
  categoryIds = [];
  transactionIds = [];
  budgetIds = [];
  for (const userId of userIds) {
    const category = await db.transactionCategory.create({ data: { userId, name: 'Private category', icon: '🔒' } });
    categoryIds.push(category.id);
    const transaction = await db.transaction.create({ data: {
      userId, name: 'Original transaction', amount: '10', timestamp: new Date(Date.now() - 30 * 86400000), categoryId: category.id,
    } });
    transactionIds.push(transaction.id);
    const budget = await db.budget.create({ data: {
      userId, name: 'Original budget', max: '100', categories: { connect: { id: category.id } },
    } });
    budgetIds.push(budget.id);
  }
  mocks.revalidatePath.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  signIn(0);
});

afterEach(() => {
  vi.mocked(console.error).mockRestore();
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [...userIds, emptyUserId] } } });
  if (sharedId) await db.transactionCategory.deleteMany({ where: { id: sharedId, userId: null } });
  await db.$disconnect();
});

const snapshot = async () => ({
  transactions: await db.transaction.findMany({ where: { userId: { in: userIds } }, orderBy: { id: 'asc' } }),
  budgets: await db.budget.findMany({ where: { userId: { in: userIds } }, include: { categories: { orderBy: { id: 'asc' } } }, orderBy: { id: 'asc' } }),
  categories: await db.transactionCategory.findMany({ where: { OR: [{ userId: { in: userIds } }, { id: sharedId }] }, orderBy: { id: 'asc' } }),
});

const spyDatabaseAccess = () => [
    ...['transaction', 'transactionCategory', 'budget'].flatMap((model) =>
      ['create', 'update', 'delete', 'findMany', 'count', 'aggregate', 'groupBy'].map((method) =>
        vi.spyOn(db[model as 'transaction'], method as 'count').mockImplementation(() => { throw new Error('Unexpected database access'); })
      )
    ),
    vi.spyOn(db, '$transaction').mockImplementation(() => { throw new Error('Unexpected database access'); }),
    vi.spyOn(db, '$queryRawTyped').mockImplementation(() => { throw new Error('Unexpected database access'); }),
];

for (const actor of [0, 1]) {
  describe(`authenticated user ${actor + 1}`, () => {
    it('updates and deletes own records without changing ownership', async () => {
      signIn(actor);
      const transactionData = transactionForm(sharedId);
      const budgetData = budgetForm([sharedId]);
      transactionData.set('userId', userIds[1 - actor]);
      budgetData.set('userId', userIds[1 - actor]);
      expect(await actions.updateTransaction(transactionData, transactionIds[actor])).toEqual({ success: true });
      expect(await actions.updateBudget(budgetData, budgetIds[actor])).toEqual({ success: true });
      expect(await actions.updateTransactionCategory(categoryForm(), categoryIds[actor])).toEqual({ success: true });
      expect((await db.transaction.findUniqueOrThrow({ where: { id: transactionIds[actor] } })).userId).toBe(userIds[actor]);
      expect((await db.budget.findUniqueOrThrow({ where: { id: budgetIds[actor] } })).userId).toBe(userIds[actor]);
      expect(await actions.deleteTransaction(transactionIds[actor])).toEqual({ success: true });
      expect(await actions.deleteBudget(budgetIds[actor])).toEqual({ success: true });
      expect(await actions.deleteTransactionCategory(categoryIds[actor])).toEqual({ success: true });
    });

    it('rejects foreign and missing targets identically without claiming or mutating them', async () => {
      signIn(actor);
      const other = 1 - actor;
      const before = await snapshot();
      const missing = 2147483647;
      const edits = [
        (id: number) => actions.updateTransaction(transactionForm(sharedId), id),
        (id: number) => actions.deleteTransaction(id),
        (id: number) => actions.updateBudget(budgetForm([sharedId]), id),
        (id: number) => actions.deleteBudget(id),
        (id: number) => actions.updateTransactionCategory(categoryForm(), id),
        (id: number) => actions.deleteTransactionCategory(id),
      ];
      const ids = [transactionIds[other], transactionIds[other], budgetIds[other], budgetIds[other], categoryIds[other], categoryIds[other]];
      for (const [index, edit] of edits.entries()) {
        expect(await edit(ids[index])).toEqual(unavailable);
        expect(await edit(missing)).toEqual(unavailable);
      }
      expect(await snapshot()).toEqual(before);
      expect(mocks.revalidatePath).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('reads shared categories but cannot edit or delete them', async () => {
      signIn(actor);
      const categories = await data.getCategoryOptions();
      expect(categories.map((category) => category.id)).toContain(sharedId);
      expect(categories.map((category) => category.id)).not.toContain(categoryIds[1 - actor]);
      expect(await actions.updateTransactionCategory(categoryForm(), sharedId)).toEqual(unavailable);
      expect(await actions.deleteTransactionCategory(sharedId)).toEqual(unavailable);
      expect(await db.transactionCategory.findUniqueOrThrow({ where: { id: sharedId } })).toMatchObject({ userId: null, name: 'Shared test category' });
    });

    it('creates records with own or shared categories and ignores submitted ownership', async () => {
      signIn(actor);
      for (const id of [categoryIds[actor], sharedId]) {
        const data = transactionForm(id);
        data.set('userId', userIds[1 - actor]);
        expect(await actions.createTransaction(data)).toEqual({ success: true });
        expect(await actions.createBudget(budgetForm([id, id]))).toEqual({ success: true });
      }
      const data = categoryForm();
      data.set('userId', '');
      expect(await actions.createTransactionCategory(data)).toEqual({ success: true });
      expect(await db.transaction.count({ where: { userId: userIds[actor] } })).toBe(3);
      expect(await db.budget.count({ where: { userId: userIds[actor] } })).toBe(3);
      expect(await db.transactionCategory.count({ where: { userId: userIds[actor], name: 'Updated category' } })).toBe(1);
    });

    it('rolls back entire creates and edits with any missing or forbidden category', async () => {
      signIn(actor);
      const before = await snapshot();
      for (const invalid of [categoryIds[1 - actor], missingId]) {
        expect(await actions.createTransaction(transactionForm(invalid))).toEqual(unavailable);
        expect(await actions.updateTransaction(transactionForm(invalid), transactionIds[actor])).toEqual(unavailable);
        expect(await actions.createBudget(budgetForm([sharedId, categoryIds[actor], invalid]))).toEqual(unavailable);
        expect(await actions.updateBudget(budgetForm([sharedId, invalid]), budgetIds[actor])).toEqual(unavailable);
        expect(await snapshot()).toEqual(before);
      }
      expect(mocks.revalidatePath).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
}

it('rejects malformed identifiers and category JSON without writes', async () => {
  const before = await snapshot();
  for (const id of [0, -1, 1.5, NaN, Infinity, 2147483648]) {
    expect(await actions.deleteTransaction(id)).toMatchObject({ success: false, error: { code: 'INVALID_INPUT' } });
    expect(await actions.deleteBudget(id)).toMatchObject({ success: false, error: { code: 'INVALID_INPUT' } });
    expect(await actions.deleteTransactionCategory(id)).toMatchObject({ success: false, error: { code: 'INVALID_INPUT' } });
  }
  for (const value of ['bad JSON', 'null', '[]', '[1.5]', '["1"]', '{}']) {
    const data = budgetForm([]);
    data.set('categoryIds', value);
    expect(await actions.createBudget(data)).toMatchObject({ success: false, error: { code: 'INVALID_INPUT' } });
    expect(await actions.updateBudget(data, budgetIds[0])).toMatchObject({ success: false, error: { code: 'INVALID_INPUT' } });
  }
  expect(await snapshot()).toEqual(before);
});

it('guards every protected action before querying data or parsing inputs', async () => {
  const unreadableForm = new FormData();
  const get = vi.spyOn(unreadableForm, 'get').mockImplementation(() => {
    throw new Error('Unexpected input parsing');
  });
  const mutations = [
    () => actions.createTransactionCategory(unreadableForm),
    () => actions.updateTransactionCategory(unreadableForm, categoryIds[0]),
    () => actions.deleteTransactionCategory(categoryIds[0]),
    () => actions.createTransaction(unreadableForm),
    () => actions.updateTransaction(unreadableForm, transactionIds[0]),
    () => actions.deleteTransaction(transactionIds[0]),
    () => actions.createBudget(unreadableForm),
    () => actions.updateBudget(unreadableForm, budgetIds[0]),
    () => actions.deleteBudget(budgetIds[0]),
  ];
  const reads = [
    () => data.getCategoryCount(), () => data.getCategories(), () => data.getCategoryOptions(),
    () => data.getTransactionCount(), () => data.getTransactions(),
    () => data.getBudgetCount(), () => data.getBudgets(),
    () => data.getExpenseVsIncome(),
    () => data.getIncome(),
    () => data.getExpense(),
    () => data.getBudgetWithAmount(),
    () => data.getExpensesByCategory(),
  ];
  // Intercept database entry points only in this boundary test: any access is a failure.
  const spies = spyDatabaseAccess();
  try {
    for (const session of [null, {}, { user: {} }, ...[undefined, null, '', '  ', 123].map((id) => ({ user: { id } }))]) {
      mocks.auth.mockResolvedValue(session);
      for (const mutation of mutations) {
        expect(await mutation()).toMatchObject({ success: false, error: { code: 'UNAUTHENTICATED' } });
      }
      for (const read of reads) await expect(read()).rejects.toThrow('Authentication required.');
    }
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
});


it('sanitizes unexpected mutation errors', async () => {
  const failure = vi.spyOn(db.transaction, 'delete').mockRejectedValueOnce(new Error('Sensitive database details'));
  try {
    expect(await actions.deleteTransaction(transactionIds[0])).toEqual({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Unable to save changes. Please try again.' },
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledExactlyOnceWith('Mutation failed', {
      event: 'mutation_failed',
      action: 'deleteTransaction',
      errorCode: 'UNEXPECTED_ERROR',
    });
  } finally {
    failure.mockRestore();
  }
});


it.each([
  'createTransactionCategory', 'updateTransactionCategory', 'deleteTransactionCategory',
  'createTransaction', 'updateTransaction', 'deleteTransaction',
  'createBudget', 'updateBudget', 'deleteBudget',
] as const)('preserves successful %s writes when cache revalidation fails', async (action) => {
  const before = await snapshot();
  mocks.revalidatePath.mockImplementationOnce(() => {
    throw new Error('Sensitive cache details');
  });
  const mutations = {
    createTransactionCategory: () => actions.createTransactionCategory(categoryForm()),
    updateTransactionCategory: () => actions.updateTransactionCategory(categoryForm(), categoryIds[0]),
    deleteTransactionCategory: () => actions.deleteTransactionCategory(categoryIds[0]),
    createTransaction: () => actions.createTransaction(transactionForm(sharedId)),
    updateTransaction: () => actions.updateTransaction(transactionForm(sharedId), transactionIds[0]),
    deleteTransaction: () => actions.deleteTransaction(transactionIds[0]),
    createBudget: () => actions.createBudget(budgetForm([sharedId])),
    updateBudget: () => actions.updateBudget(budgetForm([sharedId]), budgetIds[0]),
    deleteBudget: () => actions.deleteBudget(budgetIds[0]),
  };
  expect(await mutations[action]()).toEqual({ success: true });
  expect(await snapshot()).not.toEqual(before);
  const path = action.endsWith('Budget') ? '/budgets' : '/transactions';
  expect(mocks.revalidatePath).toHaveBeenCalledExactlyOnceWith(path);
  expect(console.error).toHaveBeenCalledExactlyOnceWith('Cache revalidation failed after mutation', {
    event: 'cache_revalidation_failed', path,
  });
});

for (const actor of [0, 1]) {
  it(`isolates all default reads and counts for user ${actor + 1}`, async () => {
    signIn(actor);
    expect((await data.getTransactions()).map((row) => row.id)).toEqual([transactionIds[actor]]);
    expect((await data.getBudgets()).map((row) => row.id)).toEqual([budgetIds[actor]]);
    expect((await data.getCategories()).map((row) => row.id)).toEqual([categoryIds[actor]]);
    expect((await data.getCategoryOptions()).map((row) => row.id).sort()).toEqual([categoryIds[actor], sharedId].sort());
    expect(await data.getTransactionCount({})).toBe(1);
    expect(await data.getCategoryCount({})).toBe(1);
    expect(await data.getBudgetCount({})).toBe(1);
    expect((await data.getIncome()).amount?.toString()).toBe('10');
    expect((await data.getExpense()).amount).toBeNull();
    expect(await data.getExpensesByCategory()).toEqual([]);
    expect((await data.getBudgetWithAmount()).map((row) => row.amount.toString())).toEqual(['0']);
    const series = await data.getExpenseVsIncome();
    expect(series.map((row) => row.totalIncome?.toString())).toEqual(['10']);
  });
}

it('returns explicit minimal fields and never returns account credentials or user objects', async () => {
  const [transaction] = await data.getTransactions();
  const [budget] = await data.getBudgets();
  const [category] = await data.getCategories();
  const [option] = await data.getCategoryOptions();
  expect(Object.keys(transaction).sort()).toEqual(['id', 'name', 'amount', 'timestamp', 'type', 'categoryId', 'category'].sort());
  expect(Object.keys(transaction.category!).sort()).toEqual(['icon']);
  expect(Object.keys(budget).sort()).toEqual(['id', 'name', 'max', 'categories'].sort());
  expect(Object.keys(budget.categories[0]).sort()).toEqual(['id', 'name']);
  for (const row of [category, option]) expect(Object.keys(row).sort()).toEqual(['id', 'name', 'icon'].sort());
  expect(Object.keys(await data.getIncome())).toEqual(['amount']);
  const serialized = JSON.stringify([transaction, budget, category, option, await data.getExpenseVsIncome()]);
  for (const forbidden of ['userId', 'accounts', 'sessions', 'access_token', 'refresh_token', 'private-access-token', 'private-refresh-token']) {
    expect(serialized).not.toContain(forbidden);
  }
});

it('rejects Prisma options and ownership overrides in every read before any query', async () => {
  const reads = Object.values(data) as unknown as ((input?: unknown) => Promise<unknown>)[];
  const spies = spyDatabaseAccess();
  try {
    for (const input of [
      { userId: userIds[1] }, { where: {} }, { where: { userId: userIds[1] } },
      { where: { OR: [{ userId: userIds[1] }, {}] } },
      { select: { user: { include: { accounts: true, sessions: true } } } },
      { include: { user: { select: { accounts: { select: { access_token: true, refresh_token: true } } } } } },
      { orderBy: { user: { email: 'asc' } } }, { take: 1000000 }, { skip: -1 },
      { step: 'month' }, null, [],
      { range: { start: new Date(), end: new Date(), userId: userIds[1] } },
    ]) {
      for (const read of reads) await expect(read(input)).rejects.toThrow();
    }
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
});

it('validates bounded pagination and applies a stable ID tie-breaker', async () => {
  const createdAt = new Date('2025-01-01T00:00:00Z');
  const timestamp = new Date('2025-01-01T12:00:00Z');
  await db.transaction.update({ where: { id: transactionIds[0] }, data: { timestamp } });
  await db.transactionCategory.update({ where: { id: categoryIds[0] }, data: { createdAt } });
  await db.budget.update({ where: { id: budgetIds[0] }, data: { createdAt } });
  const category = await db.transactionCategory.create({ data: { userId: userIds[0], name: 'Second', icon: '🌱', createdAt } });
  const budget = await db.budget.create({ data: { userId: userIds[0], name: 'Second', max: '100', createdAt } });
  const transaction = await db.transaction.create({ data: { userId: userIds[0], name: 'Second', amount: '20', timestamp } });
  for (const [read, ids] of [
    [data.getTransactions, [transaction.id, transactionIds[0]]],
    [data.getCategories, [category.id, categoryIds[0]]],
    [data.getBudgets, [budget.id, budgetIds[0]]],
  ] as const) {
    expect((await read({ page: 1, pageSize: 1 })).map((row) => row.id)).toEqual([ids[0]]);
    expect((await read({ page: 2, pageSize: 1 })).map((row) => row.id)).toEqual([ids[1]]);
    expect(await read({ page: 3, pageSize: 1 })).toEqual([]);
    for (const input of [{ page: 0 }, { page: -1 }, { page: 1.5 }, { page: NaN }, { page: 1000001 }, { pageSize: 0 }, { pageSize: 101 }]) {
      await expect(read(input)).rejects.toThrow();
    }
  }
});

it('validates report ranges and uses scoped ranges consistently across counts and totals', async () => {
  const start = new Date('2025-01-01T00:00:00Z');
  const end = new Date('2025-01-02T00:00:00Z');
  await db.transaction.update({ where: { id: transactionIds[0] }, data: { type: 'EXPENSE', timestamp: start } });
  await db.transaction.update({ where: { id: transactionIds[1] }, data: { type: 'EXPENSE', amount: '9999', timestamp: start } });
  await db.transaction.create({ data: { userId: userIds[0], name: 'Outside range', amount: '200', timestamp: new Date('2024-01-01'), type: 'EXPENSE' } });
  const parsed = parseReportDateRange(start.toISOString(), end.toISOString());
  expect(parsed.success).toBe(true);
  if (!parsed.success) throw new Error('Expected valid range');
  const input = parsed.data;
  expect(await data.getTransactionCount(input)).toBe(1);
  expect((await data.getExpense(input)).amount?.toString()).toBe('10');
  expect((await data.getExpensesByCategory(input)).map((row) => [row.categoryId, row.amount.toString()])).toEqual([[categoryIds[0], '10']]);
  expect((await data.getBudgetWithAmount(input)).map((row) => row.amount.toString())).toEqual(['10']);
  expect((await data.getExpenseVsIncome(input)).map((row) => row.totalExpense?.toString())).toEqual(['10']);
  const reports = [data.getTransactionCount, data.getIncome, data.getExpense, data.getExpensesByCategory, data.getBudgetWithAmount, data.getExpenseVsIncome];
  const spies = spyDatabaseAccess();
  try {
    for (const range of [{ start: end, end: start }, { start: new Date('bad'), end }, { start }, { start: start.toISOString(), end: end.toISOString() }]) {
      for (const read of reports) await expect(read({ range } as never)).rejects.toThrow();
    }
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
});

it('returns empty results for a user without financial data even when another user has data', async () => {
  mocks.auth.mockResolvedValue({ user: { id: emptyUserId } });
  expect(await data.getTransactionCount()).toBe(0);
  expect(await data.getTransactionCount({ range: { start: new Date('2024-01-01'), end: new Date('2026-01-01') } })).toBe(0);
  expect(await data.getBudgetCount()).toBe(0);
  expect(await data.getCategoryCount()).toBe(0);
  for (const read of [data.getTransactions, data.getBudgets, data.getCategories, data.getExpensesByCategory, data.getExpenseVsIncome, data.getBudgetWithAmount]) {
    expect(await read()).toEqual([]);
  }
  expect((await data.getCategoryOptions()).map((row) => row.id)).toContain(sharedId);
  expect(await data.getIncome()).toEqual({ amount: null });
  expect(await data.getExpense()).toEqual({ amount: null });
});

it('hides legacy cross-user category links without exposing private metadata', async () => {
  await db.transaction.update({ where: { id: transactionIds[0] }, data: { categoryId: categoryIds[1], type: 'EXPENSE' } });
  await db.budget.update({ where: { id: budgetIds[0] }, data: { categories: { connect: { id: categoryIds[1] } } } });
  const [transaction] = await data.getTransactions();
  expect(transaction.category).toBeNull();
  expect(transaction.categoryId).toBeNull();
  const [budget] = await data.getBudgets();
  expect(budget.categories.map((row) => row.id)).toEqual([categoryIds[0]]);
  const expenses = await data.getExpensesByCategory();
  expect(expenses.map((row) => [row.categoryId, row.amount.toString()])).toEqual([[null, '10']]);
  expect((await data.getBudgetWithAmount())[0].amount.toString()).toBe('0');
});

it('normalizes URL pages and rejects invalid, partial, reversed or repeated report dates', () => {
  for (const value of [undefined, 'bad', '', '0', '-1', '1.2', '2abc', ['2'], '1000001']) expect(normalizePage(value)).toBe(1);
  expect(normalizePage('2')).toBe(2);
  expect(parseReportDateRange(undefined, undefined)).toMatchObject({ success: true });
  const start = '2025-01-01T00:00:00.000Z';
  const end = '2025-01-02T00:00:00.000Z';
  expect(parseReportDateRange(start, end).success).toBe(true);
  expect(parseReportDateRange('2025-01-01', '2025-01-02').success).toBe(true);
  for (const args of [[start, undefined], [undefined, end], ['bad', end], [end, start], [[start], end], ['', ''], ['2025-02-30T00:00:00.000Z', end]]) {
    expect(parseReportDateRange(...args as [unknown, unknown]).success).toBe(false);
  }
});

it('keeps the financial Server Action surface limited to mutations and logout', () => {
  expect(Object.keys(actions).sort()).toEqual([
    'logOut', 'createTransactionCategory', 'updateTransactionCategory', 'deleteTransactionCategory',
    'createTransaction', 'updateTransaction', 'deleteTransaction', 'createBudget', 'updateBudget', 'deleteBudget',
  ].sort());
});
