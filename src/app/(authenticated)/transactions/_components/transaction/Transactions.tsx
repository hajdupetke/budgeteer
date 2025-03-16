'use server';
import TransactionList from './TransactionList';
import { TransactionWithCategory } from '@/types/transaction';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import NewTransaction from './NewTransaction';
import { TransactionCategory } from '@prisma/client';

export const getTransactions = async (): Promise<TransactionWithCategory[]> => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const transactions = await db.transaction.findMany({
    where: { OR: [{ userId: session.user.id }] },
    include: {
      category: {
        select: {
          icon: true,
        },
      },
    },
  });

  const serializedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(), // Convert Decimal to number
  }));

  return serializedTransactions;
};

const Transactions = async ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
  const transactions = await getTransactions();

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Transactions</h2>
        <NewTransaction categories={categories}/>
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
