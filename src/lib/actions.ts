'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';
import { db } from './db';
import { revalidatePath } from 'next/cache';
import { auth } from './auth';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@prisma/client';
import { incomeExpense } from '@prisma/client/sql';
import { PrismaBudgetWithCategory } from '@/types/budget';

export const logOut = async () => {
  await signOut();
  redirect('/');
};

/* Create new TransactionCategory */

export const createTransactionCategory = async (formData: FormData) => {
  const icon = formData.get('icon') as string;
  const name = formData.get('name') as string;
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) return { success: false };

  await db.transactionCategory.create({
    data: {
      icon,
      name,
      user: {
        connect: { id: session.user.id },
      },
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};

export const getCategoryCount = async (dbOptions = {}) => {
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) throw new Error('User not logged in!');

  const count = await db.transactionCategory.count(dbOptions);
  return count;
};

/* Update TransactionCategory by id */

export const updateTransactionCategory = async (
  formData: FormData,
  categoryId: number
) => {
  const icon = formData.get('icon') as string;
  const name = formData.get('name') as string;
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) return { success: false };

  await db.transactionCategory.update({
    where: {
      id: categoryId,
    },
    data: {
      icon,
      name,
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};

/* Delete TransactionCategory by id */

export const deleteTransactionCategory = async (categoryId: number) => {
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) return { success: false };

  await db.transactionCategory.delete({ where: { id: categoryId } });

  revalidatePath('/transactions');
  return { success: true };
};

/* Get TransactionCategories for user */

export const getCategories = async (dbOptions = {}) => {
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) throw new Error('User not logged in');

  const categories = await db.transactionCategory.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
    ...dbOptions,
  });

  return categories;
};

/* Create a new transaction */

export const createTransaction = async (formData: FormData) => {
  const name = formData.get('name') as string;
  const amount = Number.parseFloat(formData.get('amount') as string);
  const categoryId = Number.parseInt(formData.get('categoryId') as string);
  const dateStr = formData.get('timestamp') as string;
  const transactionType = formData.get('transactionType') as string;
  const session = await auth();

  if (!session?.user) return { success: false };

  await db.transaction.create({
    data: {
      name,
      amount: new Prisma.Decimal(amount),
      timestamp: new Date(dateStr),
      type: TransactionType[transactionType as keyof typeof TransactionType],
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: {
          id: session.user.id,
        },
      },
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};

/* Update existing transaction */

export const updateTransaction = async (
  formData: FormData,
  transactionId: number
) => {
  const name = formData.get('name') as string;
  const amount = Number.parseFloat(formData.get('amount') as string);
  const categoryId = Number.parseInt(formData.get('categoryId') as string);
  const dateStr = formData.get('timestamp') as string;
  const transactionType = formData.get('transactionType') as string;
  const session = await auth();

  if (!session?.user) return { success: false };

  await db.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      name,
      amount: new Prisma.Decimal(amount),
      timestamp: new Date(dateStr),
      type: TransactionType[transactionType as keyof typeof TransactionType],
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: {
          id: session.user.id,
        },
      },
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};

export const deleteTransaction = async (transactionId: number) => {
  const session = await auth();

  // return false if user not logged in
  if (!session?.user) return { success: false };

  await db.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};

export const getTransactions = async (dbOptions = {}) => {
  const session = await auth();

  if (!session?.user) throw new Error('User is not logged in!');

  const transactions = await db.transaction.findMany({
    where: { userId: session.user.id },
    ...dbOptions,
  });

  return transactions;
};

export const getTransactionCount = async (dbOptions = {}) => {
  const session = await auth();

  if (!session?.user) throw new Error('User is not logged in!');

  const count = await db.transaction.count(dbOptions);

  return count;
};

/* Create new Budget */

export const createBudget = async (formData: FormData) => {
  const name = formData.get('name') as string;
  const max = Number.parseFloat(formData.get('max') as string);
  const categoryIds = JSON.parse(formData.get('categoryIds') as string);

  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const categories = await db.transactionCategory.findMany({
    where: { id: { in: categoryIds } },
  });

  await db.budget.create({
    data: {
      name: name,
      max: Prisma.Decimal(max),
      user: {
        connect: {
          id: session.user.id,
        },
      },
      categories: {
        connect: categories,
      },
    },
  });
  revalidatePath('/budgets');
  return { success: true };
};

export const getBudgets = async (dbOptions = {}) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
    },
    ...dbOptions,
  });

  return budgets;
};

export const deleteBudget = async (budgetId: number) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  await db.budget.delete({
    where: {
      id: budgetId,
    },
  });

  revalidatePath('/budgets');
  return { success: true };
};

export const updateBudget = async (formData: FormData, budgetId: number) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const name = formData.get('name') as string;
  const max = Number.parseFloat(formData.get('max') as string);
  const categoryIds = JSON.parse(formData.get('categoryIds') as string);

  const categories = await db.transactionCategory.findMany({
    where: { id: { in: categoryIds } },
  });

  await db.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      name: name,
      max: Prisma.Decimal(max),
      user: {
        connect: {
          id: session.user.id,
        },
      },
      categories: {
        connect: categories,
      },
    },
  });
  revalidatePath('/budgets');
  return { success: true };
};

export const getBudgetCount = async (dbOptions = {}) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const count = await db.budget.count(dbOptions);

  return count;
};

/* Report functions */

export const getExpenseVsIncome = async (
  step: string,
  startDate?: string,
  endDate?: string
) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const queryResult = await db.$queryRawTyped(
    incomeExpense(
      step,
      startDate ?? '1000-01-01',
      endDate ?? new Date().toISOString(),
      session.user.id as string
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
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const income =
    startDate && endDate
      ? await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: TransactionType.INCOME,
            userId: session.user.id,
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
          where: { type: TransactionType.INCOME, userId: session.user.id },
        });
  return income;
};

export const getExpense = async (startDate: Date, endDate: Date) => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const expense =
    startDate && endDate
      ? await db.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            type: TransactionType.EXPENSE,
            userId: session.user.id,
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
          where: { type: TransactionType.EXPENSE, userId: session.user.id },
        });
  return expense;
};

export const getBudgetWithAmount = async (expensesByCategory: any) => {
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
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

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
            userId: session.user.id,
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
            userId: session.user.id,
            category: {
              id: {
                not: undefined,
              },
            },
          },
        });

  return expensesByCategory;
};
