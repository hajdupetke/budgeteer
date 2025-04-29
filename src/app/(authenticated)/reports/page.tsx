import { Metadata } from 'next';
import { DateRangePicker } from './_components/daterange-picker';
import { Reports } from './_components/Reports/Reports';
import { getTransactionCount } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Reports',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { startDate, endDate } = await searchParams;

  const transactions =
    startDate && endDate
      ? await getTransactionCount({
          where: {
            timestamp: {
              lte: new Date(endDate as string),
              gte: new Date(startDate as string),
            },
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
        <Reports
          date={{ startDate: startDate as string, endDate: endDate as string }}
        />
      ) : (
        <div className="size-full flex items-center justify-center">
          <h1 className="text-xl font-bold">
            No data available for selected timespan
          </h1>
        </div>
      )}
    </div>
  );
}
