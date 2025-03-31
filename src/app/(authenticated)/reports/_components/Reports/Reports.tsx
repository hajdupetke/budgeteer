import { ReportTransactions } from '@/types/transaction';
import { ExpensesByCategory } from './ExpensesByCategory';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ChartConfig } from '@/components/ui/chart';
import { CategoryChartConfig, CategoryChartData } from '@/types/reports';

const getExpensesByCategory = async (
  startDate: string,
  endDate: string
): Promise<CategoryChartData[]> => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');

  const categories = await db.transactionCategory.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const expensesByCategoryId =
    startDate && endDate
      ? await db.transaction.groupBy({
          by: ['categoryId'],
          _sum: {
            amount: true,
          },
          where: {
            timestamp: {
              lte: new Date(endDate),
              gte: new Date(startDate),
            },
          },
        })
      : await db.transaction.groupBy({
          by: ['categoryId'],
          _sum: {
            amount: true,
          },
        });

  const expensesByCategory = expensesByCategoryId.map(
    (categoryExpense, index) => {
      const chartData = {
        category:
          categories[
            categories.findIndex((c) => c.id == categoryExpense.categoryId)
          ].name,
        sum: categoryExpense._sum.amount
          ? categoryExpense._sum.amount.toNumber()
          : 0,
        //fill: `var(--color-primary-${(index + 1) * 100})`,
      };

      return chartData;
    }
  );

  return expensesByCategory;
};

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

  const expensesByCategory = await getExpensesByCategory(startDate, endDate);
  console.log(expensesByCategory);

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
