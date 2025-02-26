import { Metadata } from 'next';
import TransactionList from './_components/transaction/TransactionList';
import Categories from './_components/category/Categories';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default function Transactions() {
  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <TransactionList />
      <Categories />
    </div>
  );
}
