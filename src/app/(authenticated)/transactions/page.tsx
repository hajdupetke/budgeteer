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
    <div className="flex gap-2 flex-wrap xl:flex-nowrap w-full">
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
