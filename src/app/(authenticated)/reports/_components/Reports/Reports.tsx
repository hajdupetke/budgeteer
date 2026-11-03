import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { getCategories, getExpensesByCategory, getExpenseVsIncome, getBudgetWithAmount } from '@/lib/actions';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { type DateRange } from '@/lib/finance';
import { categoryChartData } from '@/lib/report-presentation';

export const Reports = async ({ date }: { date: DateRange }) => {
  const [categories, expenses, incomeExpense] = await Promise.all([
    getCategories(), getExpensesByCategory(date), getExpenseVsIncome('week', date),
  ]);
  const budgets = await getBudgetWithAmount(expenses);
  return <>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[1.3fr_1fr]">
      <IncomeExpenseChart chartData={incomeExpense} />
      <ExpensesByCategory chartData={categoryChartData(categories, expenses)} />
    </div>
    <section className="flex flex-col gap-4" aria-labelledby="report-budgets">
      <div><h2 id="report-budgets" className="text-lg font-bold">Budget breakdown</h2><p className="page-description mt-1">Selected-period spending against monthly limits. Limits are not prorated; budgets sharing categories each count the same spending.</p></div>
      <BudgetCharts chartData={budgets} />
    </section>
  </>;
};
