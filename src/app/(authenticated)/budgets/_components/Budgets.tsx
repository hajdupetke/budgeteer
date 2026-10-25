import { PageHeading } from '@/components/PageHeading';
import { monthLabel } from '@/lib/report-presentation';
import { clampPage, monthRange } from '@/lib/finance';

import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import { getCategories, getBudgets, getBudgetCount, getExpensesByCategory, getBudgetWithAmount } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const BUDGETS_PER_PAGE = 8;

const Budgets = async ({ page }: { page: number }) => {
  const session = await auth();
  if (!session?.user) return redirect('/sign-in');

  const categories = (await getCategories()).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const budgetCount = await getBudgetCount();
  page = clampPage(page, budgetCount, BUDGETS_PER_PAGE);

  const fetchedBudgets = await getBudgets({
    skip: (page - 1) * BUDGETS_PER_PAGE,
    take: BUDGETS_PER_PAGE,
  });

  const range = monthRange();
  const spending = await getBudgetWithAmount(await getExpensesByCategory(range));
  const budgets = fetchedBudgets.map((budget) => ({
    ...spending.find((item) => item.id === budget.id)!,
    ...budget,
    max: budget.max.toString(),
    categoryIds: budget.categories.map((category) => category.id),
  }));

  return <>
    <PageHeading title="Budgets" description={`${monthLabel(range.startDate)} · Monthly limits, UTC`}><NewBudget categories={categories} /></PageHeading>
    <BudgetList budgets={budgets} categories={categories} page={page} budgetCount={budgetCount} pageSize={BUDGETS_PER_PAGE} />
    <p className="page-description">Budgets sharing categories each count the same spending.</p>
  </>;
};

export default Budgets;
