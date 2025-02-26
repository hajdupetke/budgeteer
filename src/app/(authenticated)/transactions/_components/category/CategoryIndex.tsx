'use server';

import CategoryList from './CategoryList';
import NewCategory from './NewCategory';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const getTransactionCategories = async () => {
  const session = await auth();

  if (!session?.user) throw new Error('User not logged in');
  console.log(session.user);

  const categories = await db.transactionCategory.findMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }] },
  });

  return categories;
};

const CategoryIndex = async () => {
  const categories = await getTransactionCategories();
  console.log(categories);

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
