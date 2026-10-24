import 'server-only';

import { Prisma, TransactionType } from '@prisma/client';
import { incomeExpense } from '@prisma/client/sql';
import { requireUserId } from './authorization';
import { runReadQuery, parseReadInput, checkResultLimit } from './read-query';
import {
  EmptyReadSchema, ReportReadSchema, CountReadSchema, paginationSchema, MAX_READ_RESULTS, MAX_CATEGORIES,
  type PageInput, type ReportReadInput, type DateRange,
} from './validation';

const categorySelect = { id: true, name: true, icon: true } as const;
const visibleCategories = (userId: string) => ({ OR: [{ userId }, { userId: null }] });
const timestampFilter = (range?: DateRange) => range ? { gte: range.start, lte: range.end } : undefined;
const transactionPageSchema = paginationSchema(6);
const categoryPageSchema = paginationSchema(10);
const budgetPageSchema = paginationSchema(8);

const queryCategoryOptions = async (tx: Prisma.TransactionClient, userId: string) => checkResultLimit(await tx.transactionCategory.findMany({
  where: visibleCategories(userId),
  select: categorySelect,
  orderBy: [{ name: 'asc' }, { id: 'asc' }],
  take: MAX_READ_RESULTS + 1,
}), 'categories');

export const getCategoryOptions = async (input: Record<string, never> = {}) => {
  const userId = await requireUserId();
  parseReadInput(EmptyReadSchema, input);
  return runReadQuery((tx) => queryCategoryOptions(tx, userId));
};

export const getCategories = async (input: PageInput = {}) => {
  const userId = await requireUserId();
  const { page, pageSize } = parseReadInput(categoryPageSchema, input);
  return runReadQuery(async (tx) => {
    return tx.transactionCategory.findMany({
      where: { userId }, select: categorySelect,
      skip: (page - 1) * pageSize, take: pageSize,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });
};

export const getCategoryCount = async (input: Record<string, never> = {}) => {
  const userId = await requireUserId();
  parseReadInput(EmptyReadSchema, input);
  return runReadQuery(async (tx) => {
    return tx.transactionCategory.count({ where: { userId } });
  });
};

export const getTransactions = async (input: PageInput = {}) => {
  const userId = await requireUserId();
  const { page, pageSize } = parseReadInput(transactionPageSchema, input);
  return runReadQuery(async (tx) => {
    const rows = await tx.transaction.findMany({
      where: { userId },
      select: {
        id: true, name: true, amount: true, timestamp: true, type: true,
        category: {
          where: visibleCategories(userId),
          select: { id: true, icon: true },
        },
      },
      skip: (page - 1) * pageSize, take: pageSize,
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
    });
    return rows.map((row) => ({
      id: row.id, name: row.name, amount: row.amount,
      timestamp: row.timestamp, type: row.type,
      categoryId: row.category?.id ?? null,
      category: row.category ? { icon: row.category.icon } : null,
    }));
  });
};

export const getTransactionCount = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(CountReadSchema, input);
  return runReadQuery(async (tx) => {
    return tx.transaction.count({ where: { userId, timestamp: timestampFilter(range) } });
  });
};

const budgetSelect = (userId: string) => ({
  id: true, name: true, max: true,
  categories: {
    where: visibleCategories(userId),
    select: { id: true, name: true },
    orderBy: { id: 'asc' as const },
    take: MAX_CATEGORIES + 1,
  },
} as const);

export const getBudgets = async (input: PageInput = {}) => {
  const userId = await requireUserId();
  const { page, pageSize } = parseReadInput(budgetPageSchema, input);
  return runReadQuery(async (tx) => {
    const budgets = await tx.budget.findMany({
      where: { userId }, select: budgetSelect(userId),
      skip: (page - 1) * pageSize, take: pageSize,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return budgets.map((budget) => ({ ...budget, categories: checkResultLimit(budget.categories, 'budget categories', MAX_CATEGORIES) }));
  });
};

export const getBudgetCount = async (input: Record<string, never> = {}) => {
  const userId = await requireUserId();
  parseReadInput(EmptyReadSchema, input);
  return runReadQuery(async (tx) => {
    return tx.budget.count({ where: { userId } });
  });
};

const queryTotal = async (tx: Prisma.TransactionClient, userId: string, type: TransactionType, range?: DateRange) => {
  const result = await tx.transaction.aggregate({
    where: { userId, type, timestamp: timestampFilter(range) },
    _sum: { amount: true },
  });
  return { amount: result._sum.amount };
};

export const getIncome = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(ReportReadSchema, input);
  return runReadQuery(async (tx) => {
    return queryTotal(tx, userId, TransactionType.INCOME, range);
  });
};

export const getExpense = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(ReportReadSchema, input);
  return runReadQuery(async (tx) => {
    return queryTotal(tx, userId, TransactionType.EXPENSE, range);
  });
};

const queryExpensesByCategory = async (tx: Prisma.TransactionClient, userId: string, range?: DateRange) => {
  const rows = await tx.transaction.groupBy({
    by: ['categoryId'], _sum: { amount: true },
    where: {
      userId, type: TransactionType.EXPENSE, timestamp: timestampFilter(range),
      // Preserve the existing report's omission of uncategorized transactions.
      categoryId: { not: null },
    },
    orderBy: { categoryId: 'asc' },
    take: MAX_READ_RESULTS + 1,
  });
  const visibleIds = new Set((await queryCategoryOptions(tx, userId)).map((category) => category.id));
  const totals = new Map<number | null, Prisma.Decimal>();
  for (const row of checkResultLimit(rows, 'category groups')) {
    const id = row.categoryId !== null && visibleIds.has(row.categoryId) ? row.categoryId : null;
    totals.set(id, (totals.get(id) ?? new Prisma.Decimal(0)).plus(row._sum.amount ?? 0));
  }
  return [...totals].map(([categoryId, amount]) => ({ categoryId, amount }));
};

export const getExpensesByCategory = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(ReportReadSchema, input);
  return runReadQuery(async (tx) => {
    return queryExpensesByCategory(tx, userId, range);
  });
};

export const getBudgetWithAmount = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(ReportReadSchema, input);
  return runReadQuery(async (tx) => {
    const budgets = await tx.budget.findMany({
      where: { userId }, select: budgetSelect(userId),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: MAX_READ_RESULTS + 1,
    });
    const expenses = await queryExpensesByCategory(tx, userId, range);
    const totals = new Map(expenses.map((row) => [row.categoryId, row.amount]));
    return checkResultLimit(budgets, 'budgets').map((budget) => ({
      name: budget.name, max: budget.max,
      amount: checkResultLimit(budget.categories, 'budget categories', MAX_CATEGORIES).reduce((sum, category) => sum.plus(totals.get(category.id) ?? 0), new Prisma.Decimal(0)),
    }));
  });
};

export const getExpenseVsIncome = async (input: ReportReadInput = {}) => {
  const userId = await requireUserId();
  const { range } = parseReadInput(ReportReadSchema, input);
  return runReadQuery(async (tx) => {
    const rows = await tx.$queryRawTyped(incomeExpense(
      'week', range.start.toISOString(), range.end.toISOString(), userId
    ));
    return rows.map((row) => ({
      period: row.period?.toLocaleString(),
      totalExpense: row.totalexpense, totalIncome: row.totalincome,
    }));
  });
};
