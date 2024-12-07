import { Metadata } from 'next';
import TransactionList from './_components/TransactionList';
import CategoryIndex from './_components/category/CategoryIndex';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default function Transactions() {
  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <TransactionList />
      <CategoryIndex />
    </div>
  );
}
