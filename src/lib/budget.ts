import { Prisma } from '@prisma/client';

export function budgetSpending(limit: Prisma.Decimal, spent: Prisma.Decimal) {
  return {
    limit: limit.toFixed(2),
    spent: spent.toFixed(2),
    remaining: Prisma.Decimal.max(limit.minus(spent), 0).toFixed(2),
    overBudget: Prisma.Decimal.max(spent.minus(limit), 0).toFixed(2),
    percent: limit.greaterThan(0) ? Math.min(100, spent.dividedBy(limit).times(100).toNumber()) : 0,
  };
}
