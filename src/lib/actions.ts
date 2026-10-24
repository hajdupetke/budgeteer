'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';
import { db } from './db';
import { revalidatePath } from 'next/cache';
import {
  runMutation,
  categoryConnection,
} from './authorization';
import type { MutationResult } from './authorization';
import { RecordIdSchema, parseCategoryForm, parseTransactionForm, parseBudgetForm } from './validation';
import { Prisma } from '@prisma/client';

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
    const { icon, name } = parseCategoryForm(formData);

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

/* Update TransactionCategory by id */

export const updateTransactionCategory = async (
  formData: FormData,
  categoryId: number
) => {
  const result = await runMutation('updateTransactionCategory', async (userId) => {
    const { icon, name } = parseCategoryForm(formData);

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

/* Create a new transaction */

export const createTransaction = async (formData: FormData) => {
  const result = await runMutation('createTransaction', async (userId) => {
    const { name, amount, categoryId, timestamp, type } = parseTransactionForm(formData);

    await db.transaction.create({
      data: {
        name,
        amount: new Prisma.Decimal(amount),
        timestamp,
        type,
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
    const { name, amount, categoryId, timestamp, type } = parseTransactionForm(formData);

    await db.transaction.update({
      where: {
        id: RecordIdSchema.parse(transactionId),
        userId,
      },
      data: {
        name,
        amount: new Prisma.Decimal(amount),
        timestamp,
        type,
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

/* Create new Budget */

export const createBudget = async (formData: FormData) => {
  const result = await runMutation('createBudget', async (userId) => {
    const { name, max, categoryIds } = parseBudgetForm(formData);
    const categories = categoryIds.map((id) => categoryConnection(id, userId));

    await db.budget.create({
      data: {
        name: name,
        max: new Prisma.Decimal(max),
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
    const { name, max, categoryIds } = parseBudgetForm(formData);
    const categories = categoryIds.map((id) => categoryConnection(id, userId));

    await db.budget.update({
      where: {
        id: RecordIdSchema.parse(budgetId),
        userId,
      },
      data: {
        name: name,
        max: new Prisma.Decimal(max),
        categories: {
          connect: categories,
        },
      },
    });
  });
  return revalidateMutation(result, '/budgets');
};
