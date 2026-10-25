import { Prisma } from '@prisma/client';

export type PrismaBudgetWithCategory = Prisma.BudgetGetPayload<{
  include: { categories: { select: { name: true; id: true } } };
}>;

export type BudgetWithCategory = Omit<PrismaBudgetWithCategory, 'max'> & {
  max: string;
  categoryIds: number[];
};

export type BudgetSpending = {
  limit: string;
  spent: string;
  remaining: string;
  overBudget: string;
  percent: number;
};

export type BudgetSummary = BudgetSpending & { id: number; name: string };
