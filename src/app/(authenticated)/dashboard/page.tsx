import {
  getExpense,
  getIncome,
  getCategories,
  getBudgets,
  getExpensesByCategory,
  getExpenseVsIncome,
  getBudgetWithAmount,
} from '@/lib/actions';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { PrismaBudgetWithCategory, BudgetWithCategory } from '@/types/budget';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) redirect('/sign-in');

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const now = new Date();

  const income = await getIncome(oneMonthAgo, now);
  const expense = await getExpense(oneMonthAgo, now);

  const categories = await getCategories({
    select: {
      id: true,
      name: true,
    },
  });

  const expensesByCategory = await getExpensesByCategory(
    oneMonthAgo.toISOString(),
    now.toISOString()
  );

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
  const budgetWithAmount = await getBudgetWithAmount(expensesByCategory);

  const incomeExpenseResponse = await getExpenseVsIncome(
    'week',
    oneMonthAgo.toISOString(),
    now.toISOString()
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-bold text-3xl">Welcome back, {session.user.name}!</h2>
      <p>These are your spending stastics from the past month.</p>
      <div className="grid grid-cols-2 flex-wrap gap-3">
        <div className="h-full flex flex-col gap-3">
          <Card className="h-full">
            <CardContent>{income._sum.amount?.toNumber()}</CardContent>
          </Card>
          <Card className="h-full">
            <CardContent>{expense._sum.amount?.toNumber()}</CardContent>
          </Card>
        </div>
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetWithAmount} />
        <IncomeExpenseChart chartData={incomeExpenseResponse} />
      </div>
    </div>
  );
}
