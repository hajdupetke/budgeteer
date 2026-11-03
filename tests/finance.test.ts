import { describe, expect, it } from 'vitest';
import { calendarDate, dateBounds, formatMoney, monthRange, parsePage, clampPage, percentageChange } from '../src/lib/finance';
import { budgetInput, MoneySchema, transactionInput, TransactionCategorySchema } from '../src/lib/validation';

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const transaction = { name: 'Lunch', amount: '12.34', categoryId: '', timestamp: '2024-02-29T12:00:00Z', transactionType: 'EXPENSE' };

describe('server validation', () => {
  it('accepts exact decimal amounts, trims names, and supports uncategorized transactions', () => {
    expect(transactionInput(form({ ...transaction, name: '  Lunch  ' }))).toMatchObject({ name: 'Lunch', amount: '12.34', categoryId: null, type: 'EXPENSE' });
    expect(MoneySchema.parse('9007199254740993.01')).toBe('9007199254740993.01');
  });
  it.each(['0', '0.00', '-1', '0.001', '1.234', '1e2', 'NaN', 'Infinity', '', '12EUR', '1.2.3'])('rejects invalid money: %s', (amount) => {
    expect(() => transactionInput(form({ ...transaction, amount }))).toThrow();
  });
  it.each([
    { name: ' ' }, { categoryId: '-1' }, { categoryId: '1.2' }, { transactionType: 'OTHER' },
    { timestamp: 'invalid' }, { timestamp: '2024-02-30T12:00:00Z' }, { timestamp: '1899-12-31T00:00:00Z' }, { timestamp: '9999-01-01T00:00:00Z' },
  ])('rejects malformed transaction fields: %j', (change) => {
    expect(() => transactionInput(form({ ...transaction, ...change }))).toThrow();
  });
  it('rejects missing fields and malformed budget selections', () => {
    expect(() => transactionInput(new FormData())).toThrow();
    for (const categoryIds of ['{', 'null', '[]', '["1"]', '[-1]', '[1.5]']) {
      expect(() => budgetInput(form({ name: 'Food', max: '100', categoryIds }))).toThrow();
    }
    expect(() => budgetInput(form({ name: 'Food', max: '100' }))).toThrow();
    expect(() => TransactionCategorySchema.parse({ name: '   ', icon: '' })).toThrow();
  });
});

describe('reporting periods', () => {
  it('includes the selected end day and excludes the next midnight', () => {
    expect(dateBounds({ startDate: '2024-02-28', endDate: '2024-02-29' })).toEqual({
      gte: new Date('2024-02-28T00:00:00Z'), lt: new Date('2024-03-01T00:00:00Z'),
    });
    expect(dateBounds({ startDate: '2025-12-31' })?.lt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(dateBounds()).toBeUndefined();
  });
  it.each(['0000-01-01', '2025-02-29', '2024-02-30', '2024-13-01', 'invalid', '2024-01-01T00:00:00Z', '2024-1-1'])('rejects invalid calendar dates: %s', (value) => {
    expect(() => calendarDate(value)).toThrow();
  });
  it('rejects reversed ranges and an end date without a start date', () => {
    expect(() => dateBounds({ startDate: '2024-03-01', endDate: '2024-02-29' })).toThrow();
    expect(() => dateBounds({ endDate: '2024-03-01' })).toThrow();
  });
  it('uses full UTC calendar months, including leap years and year rollover', () => {
    expect(monthRange(new Date('2024-03-31T23:59:59Z'), -1)).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29' });
    expect(monthRange(new Date('2025-01-01T00:00:00Z'), -1)).toEqual({ startDate: '2024-12-01', endDate: '2024-12-31' });
    expect(monthRange(new Date('2026-10-01T00:30:00Z'))).toEqual({ startDate: '2026-10-01', endDate: '2026-10-31' });
  });
});

describe('comparisons and pagination', () => {
  it('calculates signed percentage changes and handles zero baselines', () => {
    expect(percentageChange(150, 100)).toBe(50);
    expect(percentageChange(50, 100)).toBe(-50);
    expect(percentageChange(0, 100)).toBe(-100);
    expect(percentageChange(100, 100)).toBe(0);
    expect(percentageChange(0, 0)).toBe(0);
    expect(percentageChange(100, 0)).toBeNull();
    expect(formatMoney(0)).toBe('€0.00');
    expect(formatMoney('9007199254740993.01')).toBe('€9,007,199,254,740,993.01');
  });
  it.each([undefined, ['2'], '0', '-1', '1.5', '2junk', '1e2', 'Infinity', '9007199254740992'])('defaults invalid pages to one: %j', (value) => {
    expect(parsePage(value)).toBe(1);
  });
  it('keeps valid pages and recovers after deleting the last item', () => {
    expect(parsePage('3')).toBe(3);
    expect(clampPage(3, 12, 6)).toBe(2);
    expect(clampPage(2, 0, 6)).toBe(1);
  });
});
