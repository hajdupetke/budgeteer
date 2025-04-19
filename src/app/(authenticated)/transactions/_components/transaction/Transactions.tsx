'use server';
import TransactionList from './TransactionList';
import { TransactionWithCategory } from '@/types/transaction';
import NewTransaction from './NewTransaction';
import { TransactionCategory } from '@prisma/client';
import { getTransactionCount, getTransactions } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';

const TRANSACTION_ITEMS_PER_PAGE = 7;

const Transactions = async ({
  categories,
  page,
}: {
  categories: TransactionCategory[];
  page: number;
}) => {
  const transactionCount = await getTransactionCount();

  const transactions = (
    await getTransactions({
      include: {
        category: {
          select: {
            icon: true,
          },
        },
      },
      skip: (page - 1) * TRANSACTION_ITEMS_PER_PAGE,
      take: TRANSACTION_ITEMS_PER_PAGE,
      orderBy: {
        timestamp: 'desc',
      },
    })
  ).map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(),
  })) as TransactionWithCategory[];

  console.log(transactions);

  return (
    <Card className="w-full py-4 gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-3xl">Transactions</h2>
          <NewTransaction categories={categories} />
        </div>
      </CardHeader>
      <CardContent>
        <TransactionList transactions={transactions} categories={categories} />
      </CardContent>
      <CardFooter>
        <PaginationWithLinks
          page={page}
          totalCount={transactionCount}
          pageSize={TRANSACTION_ITEMS_PER_PAGE}
          pageSearchParam="transactionPage"
        />
      </CardFooter>
    </Card>
  );
};

export default Transactions;
