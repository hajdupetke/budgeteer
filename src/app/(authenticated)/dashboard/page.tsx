import { getExpense, getIncome, getCategories, getExpensesByCategory, getExpenseVsIncome, getBudgetWithAmount } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ExpensesByCategory } from '@/components/ui/charts/ExpensesByCategory';
import { BudgetCharts } from '@/components/ui/charts/BudgetCharts';
import { IncomeExpenseChart } from '@/components/ui/charts/IncomeExpenseChart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatMoney, monthRange, percentageChange } from '@/lib/finance';

export const metadata: Metadata = { title: 'Dashboard' };

function Comparison({ current, previous, expense = false }: { current: number; previous: number; expense?: boolean }) {
  const change = percentageChange(current, previous);
  if (change === null) return <p>No previous-month baseline.</p>;
  if (change === 0) return <p>Unchanged from the previous month.</p>;
  const up = change > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return <p className={`flex items-center gap-2 ${up !== expense ? 'text-success-800' : 'text-warning-900'}`}>
    <Icon aria-hidden="true" />{expense ? 'Expenses are' : 'Income is'} {up ? 'up' : 'down'} {Math.abs(change).toFixed(2)}% from the previous month.
  </p>;
}

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const now = new Date();
  const range = monthRange(now);
  const previousRange = monthRange(now, -1);
  const [income, expense, previousIncome, previousExpense, categories, expenses, incomeExpense] = await Promise.all([
    getIncome(range), getExpense(range), getIncome(previousRange), getExpense(previousRange),
    getCategories(), getExpensesByCategory(range), getExpenseVsIncome('week', range),
  ]);
  const budgets = await getBudgetWithAmount(expenses);
  const categoryData = expenses.map((item, index) => ({
    category: categories.find((category) => category.id === item.categoryId)?.name ?? 'Uncategorized',
    sum: item._sum.amount?.toNumber() ?? 0,
    fill: `var(--chart-color-${index % 5 + 1})`,
  }));
  const incomeAmount = income._sum.amount?.toNumber() ?? 0;
  const expenseAmount = expense._sum.amount?.toNumber() ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-bold text-3xl">Welcome back{session.user.name ? `, ${session.user.name}` : ''}!</h2>
      <p>Current calendar month: {range.startDate} – {range.endDate} (UTC). Compared with {previousRange.startDate} – {previousRange.endDate}.</p>
      {incomeExpense.length === 0 && <p>No transactions this month. Add a transaction to see your spending here.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader><CardTitle>Income this month</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-extrabold">{formatMoney(incomeAmount)}</p></CardContent>
            <CardFooter><Comparison current={incomeAmount} previous={previousIncome._sum.amount?.toNumber() ?? 0} /></CardFooter>
          </Card>
          <Card>
            <CardHeader><CardTitle>Expenses this month</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-extrabold">{formatMoney(expenseAmount)}</p></CardContent>
            <CardFooter><Comparison current={expenseAmount} previous={previousExpense._sum.amount?.toNumber() ?? 0} expense /></CardFooter>
          </Card>
        </div>
        <ExpensesByCategory chartData={categoryData} />
        <BudgetCharts chartData={budgets} />
        <IncomeExpenseChart chartData={incomeExpense} />
      </div>
      <p>Budgets sharing categories each count the same spending.</p>
    </div>
  );
}
