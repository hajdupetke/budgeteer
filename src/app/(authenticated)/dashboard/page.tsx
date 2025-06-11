import {
  getExpense,
  getIncome,
  getCategories,
  getExpensesByCategory,
  getExpenseVsIncome,
  getBudgetWithAmount,
  getTransactionCount,
} from '@/lib/actions';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) redirect('/sign-in');

  console.log(session.user);

  const transactionCount = await getTransactionCount();

  if (transactionCount <= 0) {
    return (
      <div>
        You haven&apos;t added provided any data yet. When you the breakdown of
        your last month will appear here.
      </div>
    );
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const now = new Date();

  const income = await getIncome(oneMonthAgo, now);
  const expense = await getExpense(oneMonthAgo, now);

  const twoMonthsAgo = new Date(oneMonthAgo);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

  const previousIncome = await getIncome(twoMonthsAgo, oneMonthAgo);
  const previousExpense = await getExpense(twoMonthsAgo, oneMonthAgo);

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
      <h2 className="font-bold text-3xl">
        Welcome back{session.user.name ? `, ${session.user.name}` : ''}!
      </h2>
      <p>These are your spending stastics from the past month.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 flex-wrap gap-3">
        <div className="h-full flex flex-col gap-3">
          <Card className="h-full">
            <CardContent className="flex flex-col justify-center gap-4 h-full">
              <CardTitle className="">
                Your income over the past month
              </CardTitle>
              <div className="text-2xl font-extrabold">
                {income._sum.amount?.toNumber()} EUR
              </div>
            </CardContent>
            {previousIncome._sum.amount && income._sum.amount && (
              <CardFooter>
                {previousIncome._sum.amount.toNumber() >=
                income._sum.amount?.toNumber() ? (
                  <div className="flex gap-2 items-center text-warning-900">
                    <TrendingDown /> Your income is down{' '}
                    {(
                      previousIncome._sum.amount.toNumber() /
                      income._sum.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-success-800">
                    <TrendingUp /> Your income is up{' '}
                    {(
                      previousIncome._sum.amount.toNumber() /
                      income._sum.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
          <Card className="h-full justify-between">
            <CardContent className="flex flex-col justify-center gap-4 h-full">
              <CardTitle>Your expenses over the past month</CardTitle>
              <div className="text-2xl font-extrabold">
                {expense._sum.amount?.toNumber()} EUR
              </div>
            </CardContent>
            {previousExpense._sum.amount && expense._sum.amount && (
              <CardFooter>
                {previousExpense._sum.amount.toNumber() >=
                expense._sum.amount?.toNumber() ? (
                  <div className="flex gap-2 items-center text-success-800">
                    <TrendingDown /> Your expenses are down{' '}
                    {(
                      previousExpense._sum.amount.toNumber() /
                      expense._sum.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-warning-900">
                    <TrendingUp /> Your expense is up{' '}
                    {(
                      previousExpense._sum.amount.toNumber() /
                      expense._sum.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetWithAmount} />
        <IncomeExpenseChart chartData={incomeExpenseResponse} />
      </div>
    </div>
  );
}
