'use server';

import { BudgetWithCategory, PrismaBudgetWithCategory } from '@/types/budget';
import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import {
  getCategories,
  getBudgets,
  getExpensesByCategory,
} from '@/lib/actions';
import { BudgetCharts } from '../../reports/_components/Reports/BudgetCharts';

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

  const date = new Date();
  date.setMonth(date.getMonth() - 1);

  const expensesByCategory = await getExpensesByCategory(
    date.toLocaleString(),
    new Date().toLocaleString()
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
      <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-4 items-center justify-center flex-row">
        <BudgetList budgets={budgets} categories={categories} />
      </div>
    </div>
  );
};

export default Budgets;
