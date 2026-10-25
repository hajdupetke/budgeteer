import { type ReactNode } from 'react';
import { clampPage } from '@/lib/finance';
import TransactionList from './TransactionList';
import NewTransaction from './NewTransaction';
import { getTransactionCount, getTransactions, getCategories } from '@/lib/actions';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { PageHeading } from '@/components/PageHeading';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

const TRANSACTION_ITEMS_PER_PAGE = 6;
export default async function Transactions({ page, categoryManager }: { page: number; categoryManager: ReactNode }) {
  const count = await getTransactionCount();
  page = clampPage(page, count, TRANSACTION_ITEMS_PER_PAGE);
  const [categories, rows] = await Promise.all([
    getCategories(), getTransactions({ skip: (page - 1) * TRANSACTION_ITEMS_PER_PAGE, take: TRANSACTION_ITEMS_PER_PAGE }),
  ]);
  const transactions = rows.map((transaction) => ({ ...transaction, amount: transaction.amount.toString() }));
  return <>
    <PageHeading title="Transactions" description="Your income and expenses, all in one place.">
      {categoryManager}<NewTransaction categories={categories} />
    </PageHeading>
    {count > 0 ? <>
      <TransactionList transactions={transactions} categories={categories} />
      <PaginationWithLinks page={page} totalCount={count} pageSize={TRANSACTION_ITEMS_PER_PAGE} pageSearchParam="transactionPage" />
      <p className="page-description">{count} {count === 1 ? 'transaction' : 'transactions'} · Amounts in EUR · Dates in UTC</p>
    </> : <div className="rounded-xl border bg-card"><Empty><EmptyHeader><EmptyTitle>Start with your first transaction</EmptyTitle><EmptyDescription>Add income or an expense. Your monthly overview and reports will update automatically.</EmptyDescription></EmptyHeader></Empty></div>}
  </>;
}
