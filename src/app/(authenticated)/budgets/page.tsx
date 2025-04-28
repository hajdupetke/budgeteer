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
  const page = (await searchParams).page as string;

  return (
    <>
      <Budgets page={page != undefined ? Number.parseInt(page) : 1} />
    </>
  );
}
