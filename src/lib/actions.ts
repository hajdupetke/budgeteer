'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';
import { db } from './db';
import { revalidatePath } from 'next/cache';
import { auth } from './auth';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@prisma/client';

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

  const newCategory = await db.transactionCategory.create({
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

  const newCategory = await db.transactionCategory.update({
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
  console.log(transactionType);

  const newTransaction = await db.transaction.create({
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

  const updatedTransaction = await db.transaction.update({
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
  console.log(dbOptions);

  if (!session?.user) throw new Error('User is not logged in!');

  const transactions = db.transaction.findMany({
    where: { OR: [{ userId: session.user.id }] },
    ...dbOptions,
  });

  return transactions;
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
          },
        })
      : await db.transaction.groupBy({
          by: ['categoryId'],
          _sum: {
            amount: true,
          },
          where: { type: TransactionType.EXPENSE },
        });
  return expensesByCategory;
};
