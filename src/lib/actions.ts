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
  await db.transactionCategory.delete({ where: { id: categoryId } });

  revalidatePath('/transactions');
  return { success: true };
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

  const newTransaction = await db.transaction.create({
    data: {
      name,
      amount: new Prisma.Decimal(amount),
      timestamp: new Date(dateStr),
      type:
        transactionType === 'income'
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
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
      type:
        transactionType === 'income'
          ? TransactionType.INCOME
          : TransactionType.EXPENSE,
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
  await db.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  revalidatePath('/transactions');
  return { success: true };
};
