import { Metadata } from 'next';
import Transactions from './_components/transaction/Transactions';
import Categories from './_components/category/Categories';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { transactionPage, categoryPage } = await searchParams;

  return (
    <div className="flex gap-2 flex-wrap xl:flex-nowrap size-full">
      <Transactions
        page={
          transactionPage != undefined
            ? Number.parseInt(transactionPage as string)
            : 1
        }
      />
      <Categories
        page={
          categoryPage != undefined
            ? Number.parseInt(categoryPage as string)
            : 1
        }
      />
    </div>
  );
}
