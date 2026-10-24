import { renderReadSection } from '@/components/read-boundary';
import { getCategories, getCategoryCount } from '@/lib/data';
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

const CategoriesContent = async ({ page }: { page: number }) => {
  const session = await auth();
  if (!session?.user) return redirect('/sign-in');

  const categoryCount = await getCategoryCount();

  const categories = await getCategories({ page, pageSize: CATEGORIES_PER_PAGE });

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
          You haven&apos;t provided any categories yet!
        </CardContent>
      )}
    </Card>
  );
};

export default async function Categories(props: { page: number }) {
  return renderReadSection(() => CategoriesContent(props));
}
