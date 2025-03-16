'use server';

import { TransactionCategory } from '@prisma/client';
import CategoryList from './CategoryList';
import NewCategory from './NewCategory';

const Categories = async ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
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

export default Categories;
