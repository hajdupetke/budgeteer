import Link from 'next/link';
import { BudgetProgress } from '@/components/BudgetProgress';
import { type BudgetSummary } from '@/types/budget';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

export function BudgetCharts({ chartData }: { chartData: BudgetSummary[] }) {
  if (chartData.length === 0) return <div className="rounded-xl border bg-card">
    <Empty><EmptyHeader><EmptyTitle>Give your spending a plan</EmptyTitle><EmptyDescription>Create a budget for the categories you want to keep an eye on.</EmptyDescription></EmptyHeader><EmptyContent><Button asChild variant="outline"><Link href="/budgets">Create a budget</Link></Button></EmptyContent></Empty>
  </div>;
  return <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {chartData.map((budget) => <article key={budget.id} className="flex min-w-0 flex-col gap-5 rounded-xl border bg-card p-5">
      <h3 className="truncate font-bold" title={budget.name}>{budget.name}</h3>
      <BudgetProgress budget={budget} />
    </article>)}
  </div>;
}
