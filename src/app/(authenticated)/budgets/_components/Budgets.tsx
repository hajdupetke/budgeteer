import { clampPage } from '@/lib/finance';

import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import { getCategories, getBudgets, getBudgetCount } from '@/lib/actions';
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

  const budgets = fetchedBudgets.map((budget) => ({
    ...budget,
    max: budget.max.toString(),
    categoryIds: budget.categories.map((category) => category.id),
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
      <p>Monthly budgets use the current UTC calendar month. Budgets sharing categories each count the same spending.</p>
      <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-4 items-center justify-center flex-row mt-4">
        <BudgetList
          budgets={budgets}
          categories={categories}
          page={page}
          budgetCount={budgetCount}
          pageSize={BUDGETS_PER_PAGE}
        />
      </div>
    </div>
  );
};

export default Budgets;
