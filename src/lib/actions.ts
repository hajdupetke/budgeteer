'use server';
import { redirect } from 'next/navigation';
import { signOut } from './auth';
import { db } from './db';
import { revalidatePath } from 'next/cache';
import { auth } from './auth';

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

/* Get all transaction categories */

export const getTransactionCategories = async () => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const categories = await db.transactionCategory.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
  });

  return categories;
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
