'use server';

import CategoryList from './CategoryList';
import NewCategory from './NewCategory';
import { getTransactionCategories } from '@/lib/actions';

const CategoryIndex = async () => {
  const categories = await getTransactionCategories();

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Categories</h2>
        <NewCategory />

      </div>
      <CategoryList categories={categories} />
    </div>
  );
};

export default CategoryIndex;
