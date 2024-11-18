'use server';

import CategoryList from './CategoryList';
import NewCategory from './NewCategory';
import { getTransactionCategories } from '@/lib/actions';

const CategoryIndex = async () => {
  const categories = await getTransactionCategories();

  return (
    <div className="h-full w-full rounded-xl shadow-around p-4 bg-secondary">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-3xl">Categories</h2>
        <NewCategory />
      </div>
      <div className="w-10/12 mx-auto my-5">
        <CategoryList categories={categories} />
      </div>
    </div>
  );
};

export default CategoryIndex;
