import { renderReadSection } from '@/components/read-boundary';
import {
  getExpense,
  getIncome,
  getCategoryOptions,
  getExpensesByCategory,
  getExpenseVsIncome,
  getBudgetWithAmount,
  getTransactionCount,
} from '@/lib/data';
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

async function DashboardContent() {
  const session = await auth();

  if (!session?.user) redirect('/sign-in');

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
  const range = { start: oneMonthAgo, end: now };

  const income = await getIncome({ range });
  const expense = await getExpense({ range });

  const twoMonthsAgo = new Date(oneMonthAgo);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

  const previousIncome = await getIncome({ range: { start: twoMonthsAgo, end: oneMonthAgo } });
  const previousExpense = await getExpense({ range: { start: twoMonthsAgo, end: oneMonthAgo } });

  const categories = await getCategoryOptions();

  const expensesByCategory = await getExpensesByCategory({ range });

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

  /* 
      Maps over all of the user's budgets and then finds the corresponding categories expenses' and sums it all up
    */
  const budgetWithAmount = await getBudgetWithAmount({ range });

  const incomeExpenseResponse = await getExpenseVsIncome({ range });

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
                {income.amount?.toNumber()} EUR
              </div>
            </CardContent>
            {previousIncome.amount && income.amount && (
              <CardFooter>
                {previousIncome.amount.toNumber() >=
                income.amount?.toNumber() ? (
                  <div className="flex gap-2 items-center text-warning-900">
                    <TrendingDown /> Your income is down{' '}
                    {(
                      previousIncome.amount.toNumber() /
                      income.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-success-800">
                    <TrendingUp /> Your income is up{' '}
                    {(
                      previousIncome.amount.toNumber() /
                      income.amount?.toNumber()
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
                {expense.amount?.toNumber()} EUR
              </div>
            </CardContent>
            {previousExpense.amount && expense.amount && (
              <CardFooter>
                {previousExpense.amount.toNumber() >=
                expense.amount?.toNumber() ? (
                  <div className="flex gap-2 items-center text-success-800">
                    <TrendingDown /> Your expenses are down{' '}
                    {(
                      previousExpense.amount.toNumber() /
                      expense.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                ) : (
                  <div className="flex gap-2 items-center text-warning-900">
                    <TrendingUp /> Your expense is up{' '}
                    {(
                      previousExpense.amount.toNumber() /
                      expense.amount?.toNumber()
                    ).toFixed(2)}
                    % from previous month.
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
        <ExpensesByCategory chartData={categoryExpenseChartData} />
        <BudgetCharts chartData={budgetChartData} />
        <IncomeExpenseChart chartData={incomeExpenseChartData} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  return renderReadSection(DashboardContent);
}
