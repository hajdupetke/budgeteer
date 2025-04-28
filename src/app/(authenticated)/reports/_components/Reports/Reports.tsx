import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import {
  getCategories,
  getExpensesByCategory,
  getExpenseVsIncome,
  getBudgetWithAmount,
} from '@/lib/actions';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';

export const Reports = async ({
  date,
}: {
  date: {
    startDate: string;
    endDate: string;
  };
}) => {
  const { startDate, endDate } = await date;

  const categories = await getCategories({
    select: {
      id: true,
      name: true,
    },
  });

  const expensesByCategory = await getExpensesByCategory(startDate, endDate);

  const categoryExpenseChartData = expensesByCategory.map(
    (categoryExpense, index) => {
      const chartData = {
        category:
          categories[
            categories.findIndex((c) => c.id == categoryExpense.categoryId)
          ].name,
        sum: categoryExpense._sum.amount
          ? categoryExpense._sum.amount.toNumber()
          : 0,
        fill: `var(--chart-color-${index + 1})`,
      };

      return chartData;
    }
  );

  const budgetWithAmount = await getBudgetWithAmount(expensesByCategory);

  const incomeExpenseResponse = await getExpenseVsIncome(
    'week',
    startDate,
    endDate
  );

  return (
    <div className="flex gap-3 h-full w-full flex-col items-center">
      <div className="grid grid-cols-2 gap-3 w-full">
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetWithAmount} />
      </div>
      <div className="w-3/4">
        <IncomeExpenseChart chartData={incomeExpenseResponse} />
      </div>
    </div>
  );
};
