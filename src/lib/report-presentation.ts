import type { Prisma } from '@prisma/client';

const categoryPalette = ['#8133b8', '#277e83', '#bb6240', '#5268ad', '#a74678', '#62813b', '#896924', '#477eaa'];

export function categoryColor(id: number | null) {
  if (id === null) return '#8b93a5';
  if (id > 0 && id <= categoryPalette.length) return categoryPalette[id - 1];
  return `hsl(${Math.round((id * 137.508) % 360)} 46% 43%)`;
}

export function categoryChartData(
  categories: { id: number; name: string }[],
  expenses: { categoryId: number | null; _sum: { amount: Prisma.Decimal | null } }[]
) {
  return expenses.map((expense) => ({
    categoryId: expense.categoryId,
    category: categories.find((category) => category.id === expense.categoryId)?.name ?? 'Uncategorized',
    sum: expense._sum.amount?.toNumber() ?? 0,
    fill: categoryColor(expense.categoryId),
  })).sort((a, b) => b.sum - a.sum || (a.categoryId ?? -1) - (b.categoryId ?? -1));
}

export const monthLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const shortDate = (date: string | Date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
