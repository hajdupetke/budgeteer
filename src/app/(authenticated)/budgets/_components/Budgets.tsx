'use server';

import { BudgetWithCategory, PrismaBudgetWithCategory } from '@/types/budget';
import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import { getCategories, getBudgets } from '@/lib/actions';

const Budgets = async () => {
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
  })) as PrismaBudgetWithCategory[];

  const budgets = fetchedBudgets.map((budget) => ({
    ...budget,
    max: budget.max.toNumber(),
    categoryIds: budget.categories.map((category) => category.id),
  })) as BudgetWithCategory[];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
      <BudgetList budgets={budgets} categories={categories} />
    </div>
  );
};

export default Budgets;
