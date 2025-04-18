'use server';
import TransactionList from './TransactionList';
import { TransactionWithCategory } from '@/types/transaction';
import NewTransaction from './NewTransaction';
import { TransactionCategory } from '@prisma/client';
import { getTransactions } from '@/lib/actions';

const Transactions = async ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
  const transactions = (
    await getTransactions({
      include: {
        category: {
          select: {
            icon: true,
          },
        },
      },
    })
  ).map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(),
  })) as TransactionWithCategory[];

  console.log(transactions);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Transactions</h2>
        <NewTransaction categories={categories} />
      </div>
      <TransactionList transactions={transactions} categories={categories} />
    </div>
  );
};

export default Transactions;
