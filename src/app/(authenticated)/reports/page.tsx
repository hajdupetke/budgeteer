import { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { DateRangePicker } from './_components/daterange-picker';
import { Reports } from './_components/Reports/Reports';
import { ReportTransactions } from '@/types/transaction';

export const metadata: Metadata = {
  title: 'Reports',
};

const getTransactions = async (
  startDate: string,
  endDate: string
): Promise<ReportTransactions[]> => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const transactions =
    startDate && endDate
      ? await db.transaction.findMany({
          where: {
            timestamp: {
              lte: new Date(endDate),
              gte: new Date(startDate),
            },
          },
          include: {
            category: true,
          },
        })
      : await db.transaction.findMany({ include: { category: true } });

  const serializedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toNumber(), // Convert Decimal to number
  }));

  return serializedTransactions;
};

export default async function TransactionsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: {
    startDate: string;
    endDate: string;
  };
}) {
  const { startDate, endDate } = await searchParams;

  const transactions = await getTransactions(startDate, endDate);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4 w-full">
        <h2 className="font-bold text-3xl">Financial reports</h2>
        <DateRangePicker />
      </div>
      {transactions.length > 0 ? (
        <Reports transactions={transactions} date={searchParams} />
      ) : (
        <div className="size-full flex items-center justify-center">
          <h1 className="text-xl">
            No data available for selected timespan :c
          </h1>
        </div>
      )}
    </div>
  );
}
