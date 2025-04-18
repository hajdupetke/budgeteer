import { ReportTransactions } from '@/types/transaction';
import { ExpensesByCategory } from './ExpensesByCategory';
import { getCategories, getExpensesByCategory } from '@/lib/actions';

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

  const expensesByCategory = (
    await getExpensesByCategory(startDate, endDate)
  ).map((categoryExpense, index) => {
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
  });

  return (
    <div>
      <ExpensesByCategory
        transactions={transactions}
        startDate={startDate ? new Date(startDate).toLocaleDateString() : ''}
        endDate={endDate ? new Date(endDate).toLocaleDateString() : ''}
        chartData={expensesByCategory}
      />
    </div>
  );
};
