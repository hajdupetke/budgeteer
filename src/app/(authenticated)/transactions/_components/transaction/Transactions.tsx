import TransactionList from './TransactionList';
import NewTransaction from './NewTransaction';
import {
  getTransactionCount,
  getTransactions,
  getCategoryOptions,
} from '@/lib/data';
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

  const transactionCount = await getTransactionCount();

  const categories = await getCategoryOptions();

  const transactions = (
    await getTransactions({ page, pageSize: TRANSACTION_ITEMS_PER_PAGE })
  ).map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(),
  }));

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
