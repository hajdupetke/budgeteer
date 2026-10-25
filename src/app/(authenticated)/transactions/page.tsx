import { parsePage, clampPage } from '@/lib/finance';
import { getTransactionCount, getCategoryCount } from '@/lib/actions';
import { redirect } from 'next/navigation';
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
  const params = await searchParams;
  const [transactions, categories] = await Promise.all([getTransactionCount(), getCategoryCount({ ownedOnly: true })]);
  const transactionPage = clampPage(parsePage(params.transactionPage), transactions, 6);
  const categoryPage = clampPage(parsePage(params.categoryPage), categories, 10);
  const canonical = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => canonical.append(key, item));
    else if (value !== undefined) canonical.set(key, value);
  }
  let changed = false;
  for (const [key, page] of [['transactionPage', transactionPage], ['categoryPage', categoryPage]] as const) {
    if (params[key] !== undefined && params[key] !== String(page)) {
      canonical.set(key, String(page));
      changed = true;
    }
  }
  if (changed) redirect(`/transactions?${canonical}`);

  return (
    <div className="flex gap-2 flex-wrap xl:flex-nowrap size-full">
      <Transactions page={transactionPage} />
      <Categories page={categoryPage} />
    </div>
  );
}
