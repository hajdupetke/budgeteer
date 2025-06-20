'use server';
import TransactionList from './TransactionList';
import { TransactionWithCategory } from '@/types/transaction';
import NewTransaction from './NewTransaction';
import {
  getTransactionCount,
  getTransactions,
  getCategories,
} from '@/lib/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const TRANSACTION_ITEMS_PER_PAGE = 6;

const Transactions = async ({ page }: { page: number }) => {
  const session = await auth();

  if (!session?.user) redirect('/sign-in');

  const transactionCount = await getTransactionCount({
    where: { userId: session.user.id },
  });

  const categories = await getCategories();

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

  return (
    <Card className="size-full py-4 gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-3xl">Transactions</h2>
          <NewTransaction categories={categories} />
        </div>
      </CardHeader>
      {transactionCount > 0 ? (
        <>
          <CardContent>
            <TransactionList
              transactions={transactions}
              categories={categories}
            />
          </CardContent>
          <CardFooter>
            <PaginationWithLinks
              page={page}
              totalCount={transactionCount}
              pageSize={TRANSACTION_ITEMS_PER_PAGE}
              pageSearchParam="transactionPage"
            />
          </CardFooter>
        </>
      ) : (
        <CardContent className="flex justify-center">
          You haven&apos;t provided any transactions yet!
        </CardContent>
      )}
    </Card>
  );
};

export default Transactions;
