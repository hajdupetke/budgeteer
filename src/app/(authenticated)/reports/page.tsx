import { renderReadSection } from '@/components/read-boundary';
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
  const content = parsed.success ? await renderReadSection(async () => {
    const transactions = await getTransactionCount(parsed.data);
    if (transactions > 0) return Reports({ input: parsed.data });
    return <p>No data available for selected timespan</p>;
  }) : <p role="alert">{parsed.error.issues[0]?.message ?? 'Select a valid date range.'}</p>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4 w-full">
        <h2 className="font-bold text-3xl">Financial reports</h2>
        <DateRangePicker initialRange={parsed.success ? { from: parsed.data.range.start, to: parsed.data.range.end } : undefined} />
      </div>
      {content}
    </div>
  );
}
