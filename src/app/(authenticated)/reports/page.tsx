import { Metadata } from 'next';
import Link from 'next/link';
import { DateRangePicker } from './_components/daterange-picker';
import { Reports } from './_components/Reports/Reports';
import { getTransactionCount } from '@/lib/actions';
import { dateBounds, type DateRange } from '@/lib/finance';

export const metadata: Metadata = { title: 'Reports' };

export default async function ReportsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  let range: DateRange = {};
  let error: string | undefined;
  try {
    if (Array.isArray(params.startDate) || Array.isArray(params.endDate)) throw new Error('Choose one start and end date.');
    range = { startDate: params.startDate, endDate: params.endDate };
    dateBounds(range);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Choose a valid date range.';
  }
  const count = error ? 0 : await getTransactionCount(range);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-3xl">Financial reports</h2>
        <DateRangePicker />
      </div>
      <p>{range.startDate && !error ? `${range.startDate} – ${range.endDate ?? range.startDate}` : 'All time'} (UTC)</p>
      {error ? <p role="alert">{error} <Link href="/reports" className="underline">Clear dates</Link></p>
        : count > 0 ? <Reports date={range} /> : <p>No data available for the selected period.</p>}
    </div>
  );
}
