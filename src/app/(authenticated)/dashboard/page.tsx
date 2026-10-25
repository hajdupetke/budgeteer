import { getExpense, getIncome, getCategories, getExpensesByCategory, getExpenseVsIncome, getBudgetWithAmount } from '@/lib/actions';
import { Metadata } from 'next';
import Link from 'next/link';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { formatMoney, monthRange, percentageChange } from '@/lib/finance';
import { categoryChartData, monthLabel } from '@/lib/report-presentation';
import { PageHeading } from '@/components/PageHeading';
import NewTransaction from '../transactions/_components/transaction/NewTransaction';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Overview' };

function Comparison({ current, previous, expense = false }: { current: number; previous: number; expense?: boolean }) {
  const change = percentageChange(current, previous);
  if (change === null) return <p className="text-xs text-muted-foreground">No previous-month baseline</p>;
  const Icon = change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  return <p className={cn('flex items-center gap-1 text-xs', change === 0 ? 'text-muted-foreground' : (change > 0) !== expense ? 'text-positive' : 'text-destructive')}>
    <Icon className="size-3.5" aria-hidden="true" />
    {change === 0 ? 'Unchanged' : `${Math.abs(change).toFixed(1)}% ${change > 0 ? 'up' : 'down'}`} <span className="text-muted-foreground">vs last month</span>
  </p>;
}

export default async function Dashboard() {
  const now = new Date();
  const range = monthRange(now);
  const previousRange = monthRange(now, -1);
  const [income, expense, previousIncome, previousExpense, categories, expenses, incomeExpense] = await Promise.all([
    getIncome(range), getExpense(range), getIncome(previousRange), getExpense(previousRange),
    getCategories(), getExpensesByCategory(range), getExpenseVsIncome('week', range),
  ]);
  const budgets = await getBudgetWithAmount(expenses);
  const incomeAmount = income._sum.amount;
  const expenseAmount = expense._sum.amount;
  const balance = incomeAmount ? incomeAmount.minus(expenseAmount ?? 0).toFixed(2) : expenseAmount ? expenseAmount.negated().toFixed(2) : '0.00';
  return (
    <>
      <PageHeading title="Overview" description={<>{monthLabel(range.startDate)} <span aria-hidden="true">·</span> Calendar month, UTC</>}>
        <NewTransaction categories={categories} />
      </PageHeading>
      <section aria-label="Monthly totals" className="grid overflow-hidden rounded-xl border bg-card md:grid-cols-3">
        <div className="flex flex-col gap-3 border-b px-6 py-6 md:border-r md:border-b-0">
          <h2 className="text-sm font-semibold text-muted-foreground">Income</h2>
          <p className="money break-all text-3xl font-bold">{formatMoney(incomeAmount?.toString() ?? '0')}</p>
          <Comparison current={incomeAmount?.toNumber() ?? 0} previous={previousIncome._sum.amount?.toNumber() ?? 0} />
        </div>
        <div className="flex flex-col gap-3 border-b px-6 py-6 md:border-r md:border-b-0">
          <h2 className="text-sm font-semibold text-muted-foreground">Expenses</h2>
          <p className="money break-all text-3xl font-bold">{formatMoney(expenseAmount?.toString() ?? '0')}</p>
          <Comparison current={expenseAmount?.toNumber() ?? 0} previous={previousExpense._sum.amount?.toNumber() ?? 0} expense />
        </div>
        <div className="flex flex-col gap-3 px-6 py-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Net balance</h2>
          <p className={cn('money break-all text-3xl font-bold', Number(balance) < 0 ? 'text-destructive' : 'text-primary')}>{formatMoney(balance)}</p>
          <p className="text-xs text-muted-foreground">Income minus expenses this month</p>
        </div>
      </section>
      <section className="flex flex-col gap-4" aria-labelledby="budget-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="budget-section" className="text-lg font-bold">Your monthly budgets</h2>
          <Link href="/budgets" className="text-sm font-semibold text-primary hover:underline">Manage budgets →</Link>
        </div>
        <BudgetCharts chartData={budgets} />
      </section>
      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.3fr_1fr]" aria-label="Spending breakdown">
        <IncomeExpenseChart chartData={incomeExpense} />
        <ExpensesByCategory chartData={categoryChartData(categories, expenses)} />
      </section>
    </>
  );
}
