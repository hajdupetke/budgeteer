import type { ReportReadInput } from '@/lib/validation';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import {
  getCategoryOptions,
  getExpensesByCategory,
  getExpenseVsIncome,
  getBudgetWithAmount,
} from '@/lib/data';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';

export const Reports = async ({ input }: { input: ReportReadInput }) => {
  const categories = await getCategoryOptions();
  const expensesByCategory = await getExpensesByCategory(input);

  const categoryExpenseChartData = expensesByCategory.map(
    (categoryExpense, index) => {
      const chartData = {
        category:
          categories.find((c) => c.id === categoryExpense.categoryId)?.name ?? 'Uncategorized',
        sum: categoryExpense.amount
          ? categoryExpense.amount.toNumber()
          : 0,
        fill: `var(--chart-color-${index + 1})`,
      };

      return chartData;
    }
  );

  const budgetWithAmount = await getBudgetWithAmount(input);

  const incomeExpenseResponse = await getExpenseVsIncome(input);

  const budgetChartData = budgetWithAmount.map((budget) => ({
    name: budget.name,
    max: budget.max.toNumber(),
    amount: budget.amount.toNumber(),
  }));
  const incomeExpenseChartData = incomeExpenseResponse.map((row) => ({
    period: row.period,
    totalExpense: row.totalExpense?.toNumber(),
    totalIncome: row.totalIncome?.toNumber(),
  }));

  return (
    <div className="flex gap-3 h-full w-full flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetChartData} />
      </div>
      <div className="w-full xl:w-2/5">
        <IncomeExpenseChart chartData={incomeExpenseChartData} />
      </div>
    </div>
  );
};
