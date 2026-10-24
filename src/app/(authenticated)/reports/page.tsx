import { Metadata } from 'next';
import { DateRangePicker } from './_components/daterange-picker';
import { Reports } from './_components/Reports/Reports';
import { getTransactionCount } from '@/lib/data';
import { parseReportDateRange } from '@/lib/validation';

export const metadata: Metadata = { title: 'Reports' };

export default async function ReportsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { startDate, endDate } = await searchParams;
  const parsed = parseReportDateRange(startDate, endDate);
  const transactions = parsed.success ? await getTransactionCount(parsed.data) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4 w-full">
        <h2 className="font-bold text-3xl">Financial reports</h2>
        <DateRangePicker />
      </div>
      {!parsed.success ? (
        <p role="alert">Invalid date range. Select valid start and end dates in order.</p>
      ) : transactions > 0 ? (
        <Reports input={parsed.data} />
      ) : (
        <div className="size-full flex items-center justify-center">
          <h1 className="text-xl font-bold">No data available for selected timespan</h1>
        </div>
      )}
    </div>
  );
}
