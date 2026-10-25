import { clampPage } from '@/lib/finance';
import { getCategories, getCategoryCount } from '@/lib/actions';
import ManageCategories from './ManageCategories';

const CATEGORIES_PER_PAGE = 10;
export default async function Categories({ page }: { page: number }) {
  const count = await getCategoryCount({ ownedOnly: true });
  page = clampPage(page, count, CATEGORIES_PER_PAGE);
  const categories = await getCategories({ ownedOnly: true, skip: (page - 1) * CATEGORIES_PER_PAGE, take: CATEGORIES_PER_PAGE });
  return <ManageCategories categories={categories} page={page} count={count} pageSize={CATEGORIES_PER_PAGE} />;
}
