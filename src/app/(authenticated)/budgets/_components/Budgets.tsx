import { renderReadSection } from '@/components/read-boundary';
import BudgetList from './BudgetList';
import NewBudget from './NewBudget';
import { getCategoryOptions, getBudgets, getBudgetCount } from '@/lib/data';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const BUDGETS_PER_PAGE = 8;

const BudgetsContent = async ({ page }: { page: number }) => {
  const session = await auth();
  if (!session?.user) return redirect('/sign-in');

  const categories = (
    await getCategoryOptions()
  ).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const fetchedBudgets = await getBudgets({ page, pageSize: BUDGETS_PER_PAGE });

  const budgets = fetchedBudgets.map((budget) => ({
    ...budget,
    max: budget.max.toNumber(),
    categoryIds: budget.categories.map((category) => category.id),
  }));

  const budgetCount = await getBudgetCount();

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

export default async function Budgets(props: { page: number }) {
  return renderReadSection(() => BudgetsContent(props));
}
