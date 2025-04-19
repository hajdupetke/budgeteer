import { Metadata } from 'next';
import Transactions from './_components/transaction/Transactions';
import Categories from './_components/category/Categories';
import { getCategories } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    transactionPage: string;
    categoryPage: number;
  };
}) {
  const { transactionPage, categoryPage } = await searchParams;
  const categories = await getCategories();
  console.log(transactionPage, categoryPage);

  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <Transactions
        categories={categories}
        page={Number.parseInt(transactionPage)}
      />
      <Categories categories={categories} />
    </div>
  );
}
