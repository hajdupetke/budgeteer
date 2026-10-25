import { Prisma } from '@prisma/client';

export type PrismaBudgetWithCategory = Prisma.BudgetGetPayload<{
  include: { categories: { select: { name: true; id: true } } };
}>;

export type BudgetWithCategory = Omit<PrismaBudgetWithCategory, 'max'> & {
  max: string;
  categoryIds: number[];
};
