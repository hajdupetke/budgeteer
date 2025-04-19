import { ReportTransactions } from '@/types/transaction';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import {
  getCategories,
  getExpensesByCategory,
  getBudgets,
  getExpenseVsIncome,
} from '@/lib/actions';
import { PrismaBudgetWithCategory, BudgetWithCategory } from '@/types/budget';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { Prisma } from '@prisma/client';

export const Reports = async ({
  transactions,
  date,
}: {
  transactions: ReportTransactions[];
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

  const fetchedBudgets = (await getBudgets({
    include: { categories: { select: { name: true, id: true } } },
  })) as PrismaBudgetWithCategory[];

  const budgets = fetchedBudgets.map((budget) => ({
    ...budget,
    max: budget.max.toNumber(),
    categoryIds: budget.categories.map((category) => category.id),
  })) as BudgetWithCategory[];

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

  /* 
    Maps over all of the user's budgets and then finds the corresponding categories expenses' and sums it all up
  */
  const budgetWithAmount = budgets.map((budget) => ({
    name: budget.name,
    max: budget.max,
    amount: budget.categoryIds
      .map((id) => {
        const categoryExpense = expensesByCategory.find(
          (cat) => cat.categoryId === id
        );

        return categoryExpense?._sum.amount
          ? categoryExpense._sum.amount.toNumber()
          : 0;
      })
      .reduce((acc, curr) => acc + curr, 0),
  }));

  const incomeExpenseResponse = (await getExpenseVsIncome(
    'week',
    startDate,
    endDate
  )) as {
    period: 'string';
    totalincome: Prisma.Decimal;
    totalexpense: Prisma.Decimal;
  }[];

  const incomeExpenseData = await incomeExpenseResponse.map((item) => ({
    period: new Date(item.period).toLocaleString(),
    totalIncome: item.totalincome.toNumber(),
    totalExpense: item.totalexpense.toNumber(),
  }));

  console.log(categoryExpenseChartData, budgetWithAmount, incomeExpenseData);

  return (
    <div className="flex gap-3 h-full w-full flex-col items-center">
      <div className="grid grid-cols-2 gap-3 w-full">
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetWithAmount} />
      </div>
      <div className="w-3/4">
        <IncomeExpenseChart chartData={incomeExpenseData} />
      </div>
    </div>
  );
};
