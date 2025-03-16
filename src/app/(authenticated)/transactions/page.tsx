import { Metadata } from 'next';
import Transactions from './_components/transaction/Transactions';
import Categories from './_components/category/Categories';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Transactions',
};

export const getTransactionCategories = async () => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const categories = await db.transactionCategory.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
  });

  return categories;
};

export default async function TransactionsPage() {
  const categories = await getTransactionCategories();

  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <Transactions categories={categories} />
      <Categories categories={categories} />
    </div>
  );
}
