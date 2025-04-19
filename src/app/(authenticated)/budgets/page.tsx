import { Metadata } from 'next';
import Budgets from './_components/Budgets';

export const metadata: Metadata = {
  title: 'Budgets',
};

export default function BudgetsPage() {
  return (
    <>
      <Budgets />
    </>
  );
}
