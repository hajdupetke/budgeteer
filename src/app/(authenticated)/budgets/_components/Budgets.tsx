'use server';

import { BudgetWithCategory, PrismaBudgetWithCategory } from '@/types/budget';
import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import { getCategories, getBudgets, getBudgetCount } from '@/lib/actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const BUDGETS_PER_PAGE = 8;

const Budgets = async ({ page }: { page: number }) => {
  const session = await auth();
  if (!session?.user) return redirect('/sign-in');

  const categories = (
    await getCategories({
      select: {
        id: true,
        name: true,
      },
    })
  ).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const fetchedBudgets = (await getBudgets({
    include: { categories: { select: { name: true, id: true } } },
    skip: (page - 1) * BUDGETS_PER_PAGE,
    take: BUDGETS_PER_PAGE,
  })) as PrismaBudgetWithCategory[];

  const budgets = fetchedBudgets.map((budget) => ({
    ...budget,
    max: budget.max.toNumber(),
    categoryIds: budget.categories.map((category) => category.id),
  })) as BudgetWithCategory[];

  const budgetCount = await getBudgetCount({
    where: { userId: session.user.id },
  });

  console.log(budgetCount);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
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
