import { normalizePage } from '@/lib/validation';
import { Metadata } from 'next';
import Budgets from './_components/Budgets';

export const metadata: Metadata = {
  title: 'Budgets',
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const page = normalizePage((await searchParams).page);

  return (
    <>
      <Budgets page={page} />
    </>
  );
}
