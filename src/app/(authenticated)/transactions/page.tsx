import { Metadata } from 'next';
import Transactions from './_components/transaction/Transactions';
import Categories from './_components/category/Categories';
import { getCategories } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default async function TransactionsPage() {
  const categories = await getCategories();

  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <Transactions categories={categories} />
      <Categories categories={categories} />
    </div>
  );
}
