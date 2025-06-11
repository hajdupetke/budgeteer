'use server';

import { getCategories, getCategoryCount } from '@/lib/actions';
import CategoryList from './CategoryList';
import NewCategory from './NewCategory';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const CATEGORIES_PER_PAGE = 10;

const Categories = async ({ page }: { page: number }) => {
  const session = await auth();
  if (!session?.user) return redirect('/sign-in');

  const categoryCount = await getCategoryCount({
    where: { userId: session.user.id },
  });

  console.log('categori page', page);

  const categories = await getCategories({
    where: {
      userId: session?.user.id,
    },
    skip: (page - 1) * CATEGORIES_PER_PAGE,
    take: CATEGORIES_PER_PAGE,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <Card className="w-full py-4 gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-3xl">Categories</h2>
          <NewCategory />
        </div>
      </CardHeader>
      {categoryCount > 0 ? (
        <>
          <CardContent>
            <CategoryList categories={categories} />
          </CardContent>
          <CardFooter>
            <PaginationWithLinks
              page={page}
              totalCount={categoryCount}
              pageSize={CATEGORIES_PER_PAGE}
              pageSearchParam="categoryPage"
            />
          </CardFooter>
        </>
      ) : (
        <CardContent className="flex justify-center">
          You haven't provided any categories yet!
        </CardContent>
      )}
    </Card>
  );
};

export default Categories;
