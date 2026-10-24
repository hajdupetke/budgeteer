'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';
import { db } from './db';
import { revalidatePath } from 'next/cache';
import {
  requireUserId,
  runMutation,
  categoryConnection,
} from './authorization';
import type { MutationResult } from './authorization';
import { RecordIdSchema, parseCategoryId, parseBudgetCategoryIds } from './validation';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@prisma/client';
import { incomeExpense } from '@prisma/client/sql';
import { PrismaBudgetWithCategory } from '@/types/budget';

// A failed refresh must not turn a committed write into a failed save response.
const revalidateMutation = (result: MutationResult, path: string): MutationResult => {
  if (result.success) {
    try {
      revalidatePath(path);
    } catch {
      console.error('Cache revalidation failed after mutation', {
        event: 'cache_revalidation_failed',
        path,
      });
    }
  }
  return result;
};

export const logOut = async () => {
  await signOut();
  redirect('/');
};

/* Create new TransactionCategory */

export const createTransactionCategory = async (formData: FormData) => {
  const result = await runMutation('createTransactionCategory', async (userId) => {
    const icon = formData.get('icon') as string;
    const name = formData.get('name') as string;

    await db.transactionCategory.create({
      data: {
        icon,
        name,
        user: {
          connect: { id: userId },
        },
      },
    });
  });
  return revalidateMutation(result, '/transactions');
};

export const getCategoryCount = async (dbOptions = {}) => {
  await requireUserId();

  const count = await db.transactionCategory.count(dbOptions);
  return count;
};

/* Update TransactionCategory by id */

export const updateTransactionCategory = async (
  formData: FormData,
  categoryId: number
) => {
  const result = await runMutation('updateTransactionCategory', async (userId) => {
    const icon = formData.get('icon') as string;
    const name = formData.get('name') as string;

    await db.transactionCategory.update({
      where: {
        id: RecordIdSchema.parse(categoryId),
        userId,
      },
      data: {
        icon,
        name,
      },
    });
  });
  return revalidateMutation(result, '/transactions');
};

/* Delete TransactionCategory by id */

export const deleteTransactionCategory = async (categoryId: number) => {
  const result = await runMutation('deleteTransactionCategory', async (userId) => {
    await db.transactionCategory.delete({
      where: { id: RecordIdSchema.parse(categoryId), userId },
    });
  });
  return revalidateMutation(result, '/transactions');
};

/* Get TransactionCategories for user */

export const getCategories = async (dbOptions = {}) => {
  const userId = await requireUserId();

  const categories = await db.transactionCategory.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    ...dbOptions,
  });

  return categories;
};

/* Create a new transaction */

export const createTransaction = async (formData: FormData) => {
  const result = await runMutation('createTransaction', async (userId) => {
    const name = formData.get('name') as string;
    const amount = Number.parseFloat(formData.get('amount') as string);
    const categoryId = parseCategoryId(formData.get('categoryId'));
    const dateStr = formData.get('timestamp') as string;
    const transactionType = formData.get('transactionType') as string;

    await db.transaction.create({
      data: {
        name,
        amount: new Prisma.Decimal(amount),
        timestamp: new Date(dateStr),
        type: TransactionType[transactionType as keyof typeof TransactionType],
        category: { connect: categoryConnection(categoryId, userId) },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  });
  return revalidateMutation(result, '/transactions');
};

/* Update existing transaction */

export const updateTransaction = async (
  formData: FormData,
  transactionId: number
) => {
  const result = await runMutation('updateTransaction', async (userId) => {
    const name = formData.get('name') as string;
    const amount = Number.parseFloat(formData.get('amount') as string);
    const categoryId = parseCategoryId(formData.get('categoryId'));
    const dateStr = formData.get('timestamp') as string;
    const transactionType = formData.get('transactionType') as string;

    await db.transaction.update({
      where: {
        id: RecordIdSchema.parse(transactionId),
        userId,
      },
      data: {
        name,
        amount: new Prisma.Decimal(amount),
        timestamp: new Date(dateStr),
        type: TransactionType[transactionType as keyof typeof TransactionType],
        category: { connect: categoryConnection(categoryId, userId) },
      },
    });
  });
  return revalidateMutation(result, '/transactions');
};

export const deleteTransaction = async (transactionId: number) => {
  const result = await runMutation('deleteTransaction', async (userId) => {
    await db.transaction.delete({
      where: {
        id: RecordIdSchema.parse(transactionId),
        userId,
      },
    });
  });
  return revalidateMutation(result, '/transactions');
};

export const getTransactions = async (dbOptions = {}) => {
  const userId = await requireUserId();

  const transactions = await db.transaction.findMany({
    where: { userId },
    ...dbOptions,
  });

  return transactions;
};

export const getTransactionCount = async (dbOptions = {}) => {
  await requireUserId();

  const count = await db.transaction.count(dbOptions);

  return count;
};

/* Create new Budget */

export const createBudget = async (formData: FormData) => {
  const result = await runMutation('createBudget', async (userId) => {
    const name = formData.get('name') as string;
    const max = Number.parseFloat(formData.get('max') as string);
    const categories = parseBudgetCategoryIds(formData.get('categoryIds'))
      .map((id) => categoryConnection(id, userId));

    await db.budget.create({
      data: {
        name: name,
        max: Prisma.Decimal(max),
        user: {
          connect: {
            id: userId,
          },
        },
        categories: {
          connect: categories,
        },
      },
    });
  });
  return revalidateMutation(result, '/budgets');
};

export const getBudgets = async (dbOptions = {}) => {
  const userId = await requireUserId();

  const budgets = await db.budget.findMany({
    where: {
      userId,
    },
    ...dbOptions,
  });

  return budgets;
};

export const deleteBudget = async (budgetId: number) => {
  const result = await runMutation('deleteBudget', async (userId) => {
    await db.budget.delete({
      where: {
        id: RecordIdSchema.parse(budgetId),
        userId,
      },
    });
  });
  return revalidateMutation(result, '/budgets');
};

export const updateBudget = async (formData: FormData, budgetId: number) => {
  const result = await runMutation('updateBudget', async (userId) => {
    const name = formData.get('name') as string;
    const max = Number.parseFloat(formData.get('max') as string);
    const categories = parseBudgetCategoryIds(formData.get('categoryIds'))
      .map((id) => categoryConnection(id, userId));

    await db.budget.update({
      where: {
        id: RecordIdSchema.parse(budgetId),
        userId,
      },
      data: {
        name: name,
        max: Prisma.Decimal(max),
        categories: {
          connect: categories,
        },
      },
    });
  });
  return revalidateMutation(result, '/budgets');
};

export const getBudgetCount = async (dbOptions = {}) => {
  await requireUserId();

  const count = await db.budget.count(dbOptions);

  return count;
};

/* Report functions */

export const getExpenseVsIncome = async (
  step: string,
  startDate?: string,
  endDate?: string
) => {
  const userId = await requireUserId();

  const queryResult = await db.$queryRawTyped(
    incomeExpense(
      step,
      startDate ?? '1000-01-01',
      endDate ?? new Date().toISOString(),
      userId
    )
  );

  const result = queryResult.map((res) => ({
    period: res.period?.toLocaleString(),
    totalExpense: res.totalexpense?.toNumber(),
    totalIncome: res.totalincome?.toNumber(),
  }));

  return result;
};

export const getIncome = async (startDate: Date, endDate: Date) => {
  const userId = await requireUserId();

  const income =
    startDate && endDate
      ? await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: TransactionType.INCOME,
            userId,
            timestamp: {
              lte: endDate,
              gte: startDate,
            },
          },
        })
      : await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: { type: TransactionType.INCOME, userId },
        });
  return income;
};

export const getExpense = async (startDate: Date, endDate: Date) => {
  const userId = await requireUserId();

  const expense =
    startDate && endDate
      ? await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: TransactionType.EXPENSE,
            userId,
            timestamp: {
              lte: endDate,
              gte: startDate,
            },
          },
        })
      : await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: { type: TransactionType.EXPENSE, userId },
        });
  return expense;
};

export const getBudgetWithAmount = async (expensesByCategory: any) => {
  await requireUserId();
  const budgets = (
    (await getBudgets({
      include: { categories: { select: { name: true, id: true } } },
    })) as PrismaBudgetWithCategory[]
  ).map((budget) => ({
    ...budget,
    max: budget.max.toNumber(),
    categoryIds: budget.categories.map((category) => category.id),
  }));

  /* 
      Maps over all of the user's budgets and then finds the corresponding categories expenses' and sums it all up
    */
  const budgetWithAmount = budgets.map((budget) => ({
    name: budget.name,
    max: budget.max,
    amount: budget.categoryIds
      .map((id) => {
        const categoryExpense = expensesByCategory.find(
          (cat: any) => cat.categoryId === id
        );

        return categoryExpense?._sum.amount
          ? categoryExpense._sum.amount.toNumber()
          : 0;
      })
      .reduce((acc, curr) => acc + curr, 0),
  }));

  return budgetWithAmount;
};

/* Get Expenses by category */

export const getExpensesByCategory = async (
  startDate: string,
  endDate: string
) => {
  const userId = await requireUserId();

  const expensesByCategory =
    startDate && endDate
      ? await db.transaction.groupBy({
          by: ['categoryId'],
          _sum: {
            amount: true,
          },
          where: {
            timestamp: {
              lte: new Date(endDate),
              gte: new Date(startDate),
            },
            type: TransactionType.EXPENSE,
            userId,
            category: {
              id: {
                not: undefined,
              },
            },
          },
        })
      : await db.transaction.groupBy({
          by: ['categoryId'],
          _sum: {
            amount: true,
          },
          where: {
            type: TransactionType.EXPENSE,
            userId,
            category: {
              id: {
                not: undefined,
              },
            },
          },
        });

  return expensesByCategory;
};
