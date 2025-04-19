import { Metadata } from 'next';
import Transactions from './_components/transaction/Transactions';
import Categories from './_components/category/Categories';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    transactionPage: string;
    categoryPage: string;
  };
}) {
  const { transactionPage, categoryPage } = await searchParams;

  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap lg:flex-nowrap overflow-auto">
      <Transactions
        page={
          transactionPage != undefined ? Number.parseInt(transactionPage) : 1
        }
      />
      <Categories
        page={categoryPage != undefined ? Number.parseInt(categoryPage) : 1}
      />
    </div>
  );
}
