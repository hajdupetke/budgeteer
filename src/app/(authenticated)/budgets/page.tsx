import { Metadata } from 'next';
import Budgets from './_components/Budgets';

export const metadata: Metadata = {
  title: 'Budgets',
};

export default function BudgetsPage() {
  return (
    <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-auto">
      <Budgets />
    </div>
  );
}
