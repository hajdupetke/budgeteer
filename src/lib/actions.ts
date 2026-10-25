'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { incomeExpense } from '@prisma/client/sql';
import { z } from 'zod';
import { auth, signOut } from './auth';
import { db } from './db';
import {
  InputError,
  RecordIdSchema,
  TransactionCategorySchema,
  transactionInput,
  budgetInput,
} from './validation';
import { dateBounds, type DateRange } from './finance';

type MutationResult = { success: true } | { success: false; message: string };
type Pagination = { skip?: number; take?: number };
type CategoryOptions = Pagination & { ownedOnly?: boolean };

async function userId() {
  const session = await auth();
  if (!session?.user?.id) throw new InputError('Please sign in to continue.');
  return session.user.id;
}

function pagination(options: Pagination) {
  return {
    skip: z.number().int().nonnegative().safe().parse(options.skip ?? 0),
    take: options.take === undefined
      ? undefined
      : z.number().int().min(1).max(100).parse(options.take),
  };
}

function visibleCategories(id: string) {
  return { OR: [{ userId: id }, { userId: null }] };
}

async function checkCategories(tx: Prisma.TransactionClient, id: string, ids: number[]) {
  const uniqueIds = [...new Set(ids)];
  const count = await tx.transactionCategory.count({
    where: { ...visibleCategories(id), id: { in: uniqueIds } },
  });
  if (count !== uniqueIds.length) {
    throw new InputError('A selected category is unavailable. Choose another category.');
  }
}

async function mutate(write: (id: string) => Promise<unknown>): Promise<MutationResult> {
  try {
    await write(await userId());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, message: 'This record is unavailable. Refresh and try again.' };
    }
    return {
      success: false,
      message: error instanceof InputError
        ? error.message
        : 'Could not save your changes. Try again.',
    };
  }
  for (const path of ['/transactions', '/budgets', '/dashboard', '/reports']) {
    revalidatePath(path);
  }
  return { success: true };
}

export const logOut = async () => {
  await signOut();
  redirect('/');
};

export const createTransactionCategory = async (data: FormData) => mutate(async (id) => {
  const values = TransactionCategorySchema.parse({
    name: data.get('name'), icon: data.get('icon'),
  });
  await db.transactionCategory.create({ data: { ...values, userId: id } });
});

export const updateTransactionCategory = async (data: FormData, categoryId: number) => mutate(async (id) => {
  const values = TransactionCategorySchema.parse({
    name: data.get('name'), icon: data.get('icon'),
  });
  await db.transactionCategory.update({
    where: { id: RecordIdSchema.parse(categoryId), userId: id }, data: values,
  });
});

export const deleteTransactionCategory = async (categoryId: number) => mutate(async (id) => {
  await db.transactionCategory.delete({
    where: { id: RecordIdSchema.parse(categoryId), userId: id },
  });
});

export const getCategories = async (options: CategoryOptions = {}) => {
  const id = await userId();
  return db.transactionCategory.findMany({
    where: options.ownedOnly ? { userId: id } : visibleCategories(id),
    ...pagination(options),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
};

export const getCategoryCount = async (options: { ownedOnly?: boolean } = {}) => {
  const id = await userId();
  return db.transactionCategory.count({
    where: options.ownedOnly ? { userId: id } : visibleCategories(id),
  });
};

export const createTransaction = async (data: FormData) => mutate(async (id) => {
  const { categoryId, amount, ...values } = transactionInput(data);
  await db.$transaction(async (tx) => {
    await checkCategories(tx, id, categoryId === null ? [] : [categoryId]);
    await tx.transaction.create({
      data: { ...values, amount: new Prisma.Decimal(amount), categoryId, userId: id },
    });
  });
});

export const updateTransaction = async (data: FormData, transactionId: number) => mutate(async (id) => {
  const { categoryId, amount, ...values } = transactionInput(data);
  await db.$transaction(async (tx) => {
    await checkCategories(tx, id, categoryId === null ? [] : [categoryId]);
    await tx.transaction.update({
      where: { id: RecordIdSchema.parse(transactionId), userId: id },
      data: { ...values, amount: new Prisma.Decimal(amount), categoryId },
    });
  });
});

export const deleteTransaction = async (transactionId: number) => mutate(async (id) => {
  await db.transaction.delete({
    where: { id: RecordIdSchema.parse(transactionId), userId: id },
  });
});

export const getTransactions = async (options: Pagination & DateRange = {}) => {
  const id = await userId();
  return db.transaction.findMany({
    where: { userId: id, timestamp: dateBounds(options) },
    ...pagination(options),
    include: { category: { select: { icon: true, name: true } } },
    orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
  });
};

export const getTransactionCount = async (range: DateRange = {}) => {
  const id = await userId();
  return db.transaction.count({ where: { userId: id, timestamp: dateBounds(range) } });
};

export const createBudget = async (data: FormData) => mutate(async (id) => {
  const { categoryIds, max, ...values } = budgetInput(data);
  await db.$transaction(async (tx) => {
    await checkCategories(tx, id, categoryIds);
    await tx.budget.create({
      data: {
        ...values, max: new Prisma.Decimal(max), userId: id,
        categories: { connect: [...new Set(categoryIds)].map((id) => ({ id })) },
      },
    });
  });
});

export const updateBudget = async (data: FormData, budgetId: number) => mutate(async (id) => {
  const { categoryIds, max, ...values } = budgetInput(data);
  await db.$transaction(async (tx) => {
    await checkCategories(tx, id, categoryIds);
    await tx.budget.update({
      where: { id: RecordIdSchema.parse(budgetId), userId: id },
      data: {
        ...values, max: new Prisma.Decimal(max),
        categories: { set: [...new Set(categoryIds)].map((id) => ({ id })) },
      },
    });
  });
});

export const deleteBudget = async (budgetId: number) => mutate(async (id) => {
  await db.budget.delete({ where: { id: RecordIdSchema.parse(budgetId), userId: id } });
});

export const getBudgets = async (options: Pagination = {}) => {
  const id = await userId();
  return db.budget.findMany({
    where: { userId: id },
    ...pagination(options),
    include: { categories: { select: { name: true, id: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
};

export const getBudgetCount = async () => db.budget.count({
  where: { userId: await userId() },
});

export const getIncome = async (range: DateRange = {}) => db.transaction.aggregate({
  _sum: { amount: true },
  where: { userId: await userId(), type: 'INCOME', timestamp: dateBounds(range) },
});

export const getExpense = async (range: DateRange = {}) => db.transaction.aggregate({
  _sum: { amount: true },
  where: { userId: await userId(), type: 'EXPENSE', timestamp: dateBounds(range) },
});

export const getExpensesByCategory = async (range: DateRange = {}) => db.transaction.groupBy({
  by: ['categoryId'],
  _sum: { amount: true },
  where: { userId: await userId(), type: 'EXPENSE', timestamp: dateBounds(range) },
});

export const getExpenseVsIncome = async (step: 'day' | 'week' | 'month', range: DateRange = {}) => {
  const id = await userId();
  z.enum(['day', 'week', 'month']).parse(step);
  const bounds = dateBounds(range);
  const rows = await db.$queryRawTyped(incomeExpense(
    step,
    bounds?.gte.toISOString() ?? '0001-01-01T00:00:00.000Z',
    bounds?.lt.toISOString() ?? '9999-12-31T23:59:59.999Z',
    id
  ));
  return rows.map((row) => ({
    period: row.period?.toISOString(),
    totalExpense: row.totalexpense?.toNumber() ?? 0,
    totalIncome: row.totalincome?.toNumber() ?? 0,
  }));
};

export const getBudgetWithAmount = async (
  expenses: { categoryId: number | null; _sum: { amount: Prisma.Decimal | null } }[]
) => {
  const budgets = await getBudgets();
  return budgets.map((budget) => ({
    name: budget.name,
    max: budget.max.toNumber(),
    amount: budget.categories.reduce((total, category) => {
      const spending = expenses.find((expense) => expense.categoryId === category.id);
      return total.plus(spending?._sum.amount ?? 0);
    }, new Prisma.Decimal(0)).toNumber(),
  }));
};
