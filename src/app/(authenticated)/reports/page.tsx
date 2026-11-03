import { PageHeading } from '@/components/PageHeading';
import { shortDate } from '@/lib/report-presentation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  return <>
    <PageHeading title="Reports" description={range.startDate && !error ? `${shortDate(range.startDate)} – ${shortDate(range.endDate ?? range.startDate)} · UTC` : 'All time · UTC'}>
      <DateRangePicker />
    </PageHeading>
    {error ? <Alert variant="destructive"><AlertDescription>{error} <Link href="/reports" className="underline">Clear dates</Link></AlertDescription></Alert>
      : count > 0 ? <Reports date={range} /> : <div className="rounded-xl border bg-card"><Empty><EmptyHeader><EmptyTitle>No activity in this period</EmptyTitle><EmptyDescription>Try another date range, or add a transaction to start building your reports.</EmptyDescription></EmptyHeader></Empty></div>}
  </>;
}
