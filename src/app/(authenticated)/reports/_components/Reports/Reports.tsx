import { ReportTransactions } from '@/types/transaction';
import { ExpensesByCategory } from './ExpensesByCategory';
import {
  getCategories,
  getExpensesByCategory,
  getBudgets,
} from '@/lib/actions';
import { PrismaBudgetWithCategory, BudgetWithCategory } from '@/types/budget';

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

  console.log(budgetWithAmount);

  return (
    <div>
      <ExpensesByCategory
        transactions={transactions}
        startDate={startDate ? new Date(startDate).toLocaleDateString() : ''}
        endDate={endDate ? new Date(endDate).toLocaleDateString() : ''}
        chartData={categoryExpenseChartData}
      />
    </div>
  );
};
