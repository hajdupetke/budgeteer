import { Metadata } from 'next';
import TransactionList from './_components/TransactionList';
import CategoryIndex from './_components/category/CategoryIndex';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default function Transactions() {
  return (
    <div className="flex h-full w-full gap-8">
      <TransactionList />
      <CategoryIndex />
    </div>
  );
}
