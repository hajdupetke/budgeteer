import { parsePage, clampPage } from '@/lib/finance';
import { getBudgetCount } from '@/lib/actions';
import { redirect } from 'next/navigation';
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
  const params = await searchParams;
  const page = clampPage(parsePage(params.page), await getBudgetCount(), 8);
  if (params.page !== undefined && params.page !== String(page)) {
    const canonical = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) value.forEach((item) => canonical.append(key, item));
      else if (value !== undefined) canonical.set(key, value);
    }
    canonical.set('page', String(page));
    redirect(`/budgets?${canonical}`);
  }

  return (
    <>
      <Budgets page={page} />
    </>
  );
}
