import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth, signOut: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import { db } from '@/lib/db';
import * as actions from '@/lib/actions';

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
let sharedId: number;
let missingId: number;
let categoryIds: number[];
let transactionIds: number[];
let budgetIds: number[];
const signIn = (index: number) => mocks.auth.mockResolvedValue({ user: { id: userIds[index] } });

beforeAll(async () => {
  await db.user.createMany({ data: userIds.map((id) => ({ id, email: `${id}@authorization.test` })) });
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
      userId, name: 'Original transaction', amount: '10', timestamp: new Date('2025-01-01'), categoryId: category.id,
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
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  if (sharedId) await db.transactionCategory.deleteMany({ where: { id: sharedId, userId: null } });
  await db.$disconnect();
});

const snapshot = async () => ({
  transactions: await db.transaction.findMany({ where: { userId: { in: userIds } }, orderBy: { id: 'asc' } }),
  budgets: await db.budget.findMany({ where: { userId: { in: userIds } }, include: { categories: { orderBy: { id: 'asc' } } }, orderBy: { id: 'asc' } }),
  categories: await db.transactionCategory.findMany({ where: { OR: [{ userId: { in: userIds } }, { id: sharedId }] }, orderBy: { id: 'asc' } }),
});

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
      const categories = await actions.getCategories();
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
    () => actions.getCategoryCount(), () => actions.getCategories(),
    () => actions.getTransactionCount(), () => actions.getTransactions(),
    () => actions.getBudgetCount(), () => actions.getBudgets(),
    () => actions.getExpenseVsIncome('month'),
    () => actions.getIncome(new Date(), new Date()),
    () => actions.getExpense(new Date(), new Date()),
    () => actions.getBudgetWithAmount([]),
    () => actions.getExpensesByCategory('', ''),
  ];
  // Intercept database entry points only in this boundary test: any access is a failure.
  const spies = [
    ...['transaction', 'transactionCategory', 'budget'].flatMap((model) =>
      ['create', 'update', 'delete', 'findMany', 'count', 'aggregate', 'groupBy'].map((method) =>
        vi.spyOn(db[model as 'transaction'], method as 'count').mockImplementation(() => { throw new Error('Unexpected database access'); })
      )
    ),
    vi.spyOn(db, '$queryRawTyped').mockImplementation(() => { throw new Error('Unexpected database access'); }),
  ];
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
