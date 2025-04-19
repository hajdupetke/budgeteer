import { Metadata } from 'next';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { DateRangePicker } from './_components/daterange-picker';
import { Reports } from './_components/Reports/Reports';
import { ReportTransactions } from '@/types/transaction';
import { getTransactionCount } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Reports',
};

export default async function ReportsPage({
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

  const transactions =
    startDate && endDate
      ? await getTransactionCount({
          where: {
            timestamp: { lte: new Date(endDate), gte: new Date(startDate) },
          },
        })
      : await getTransactionCount();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4 w-full">
        <h2 className="font-bold text-3xl">Financial reports</h2>
        <DateRangePicker />
      </div>
      {transactions > 0 ? (
        <Reports date={searchParams} />
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
