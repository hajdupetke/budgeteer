import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { budgetSpending } from '../src/lib/budget';
import { categoryChartData, categoryColor } from '../src/lib/report-presentation';

describe('budget presentation', () => {
  it.each([
    ['100', '0', '100.00', '0.00', 0],
    ['100', '25.10', '74.90', '0.00', 25.1],
    ['100', '100', '0.00', '0.00', 100],
    ['100', '125.01', '0.00', '25.01', 100],
    ['0', '1', '0.00', '1.00', 0],
  ])('shows remaining and over-budget amounts for limit %s and spending %s', (limit, spent, remaining, overBudget, percent) => {
    expect(budgetSpending(new Prisma.Decimal(limit), new Prisma.Decimal(spent))).toEqual({ limit: Number(limit).toFixed(2), spent: Number(spent).toFixed(2), remaining, overBudget, percent });
  });
});

describe('category presentation', () => {
  it('keeps colors stable across names, sorting, and more categories than the palette', () => {
    const categories = [{ id: 1, name: 'Food' }, { id: 999, name: 'Travel' }];
    const expense = (categoryId: number | null, amount: string) => ({ categoryId, _sum: { amount: new Prisma.Decimal(amount) } });
    const first = categoryChartData(categories, [expense(1, '10'), expense(999, '20'), expense(null, '5')]);
    const second = categoryChartData([{ id: 999, name: 'Renamed' }, categories[0]], [expense(999, '1'), expense(1, '30'), expense(null, '5')]);
    for (const id of [1, 999, null]) expect(first.find((item) => item.categoryId === id)?.fill).toBe(second.find((item) => item.categoryId === id)?.fill);
    expect(categoryColor(999)).toMatch(/^hsl\(/);
    expect(categoryColor(null)).not.toBe(categoryColor(1));
    expect(first[0].categoryId).toBe(999);
    expect(first.find((item) => item.categoryId === null)?.category).toBe('Uncategorized');
  });
  it('handles empty data and missing categories without losing their expenses', () => {
    expect(categoryChartData([], [])).toEqual([]);
    expect(categoryChartData([], [{ categoryId: 42, _sum: { amount: new Prisma.Decimal('12.34') } }])[0]).toMatchObject({ category: 'Uncategorized', sum: 12.34 });
  });
});
