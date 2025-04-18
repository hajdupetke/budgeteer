'use server';

import NewBudget from './NewBudget';
import { getCategories } from '@/lib/actions';

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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Budgets</h2>
        <NewBudget categories={categories} />
      </div>
    </div>
  );
};

export default Budgets;
