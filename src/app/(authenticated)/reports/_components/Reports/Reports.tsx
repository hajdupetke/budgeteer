import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { getCategories, getExpensesByCategory, getExpenseVsIncome, getBudgetWithAmount } from '@/lib/actions';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { type DateRange } from '@/lib/finance';

export const Reports = async ({ date }: { date: DateRange }) => {
  const [categories, expenses, incomeExpense] = await Promise.all([
    getCategories(), getExpensesByCategory(date), getExpenseVsIncome('week', date),
  ]);
  const budgetData = await getBudgetWithAmount(expenses);
  const categoryData = expenses.map((expense, index) => ({
    category: categories.find((category) => category.id === expense.categoryId)?.name ?? 'Uncategorized',
    sum: expense._sum.amount?.toNumber() ?? 0,
    fill: `var(--chart-color-${index % 5 + 1})`,
  }));
  return (
    <div className="flex gap-3 flex-col w-full">
      <p>Budget spending covers the selected period. Budgets sharing categories each count the same spending.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ExpensesByCategory chartData={categoryData} />
        <BudgetCharts chartData={budgetData} />
      </div>
      <IncomeExpenseChart chartData={incomeExpense} />
    </div>
  );
};
