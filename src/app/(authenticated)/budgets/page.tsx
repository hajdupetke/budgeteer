import { Metadata } from 'next';
import Budgets from './_components/Budgets';

export const metadata: Metadata = {
  title: 'Budgets',
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: {
    page: string;
  };
}) {
  const { page } = await searchParams;

  return (
    <>
      <Budgets page={page != undefined ? Number.parseInt(page) : 1} />
    </>
  );
}
