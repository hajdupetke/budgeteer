'use server';

import { BudgetWithCategory, PrismaBudgetWithCategory } from '@/types/budget';
import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import {
  getCategories,
  getBudgets,
  getExpensesByCategory,
} from '@/lib/actions';
import { BudgetCharts } from './BudgetCharts';

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

  /* 
    Maps over all of the user's budgets and then finds the corresponding categories expenses' and sums it all up
  */
  const budgetWithAmount = budgets.map((budget) => ({
    name: budget.name,
    max: budget.max,
    amount: budget.categoryIds
      .map((id) => {
        const categoryExpense = expensesByCategory.find(
          (cat) => cat.categoryId === id
        );

        return categoryExpense?._sum.amount
          ? categoryExpense._sum.amount.toNumber()
          : 0;
      })
      .reduce((acc, curr) => acc + curr, 0),
  }));

  console.log(budgetWithAmount);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
      <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-4 items-center justify-center flex-row">
        <BudgetList budgets={budgets} categories={categories} />
        <BudgetCharts chartData={budgetWithAmount} />
      </div>
    </div>
  );
};

export default Budgets;
