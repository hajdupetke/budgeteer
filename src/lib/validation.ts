import { z } from 'zod';

/* TransactionCategory Schema */

export const TransactionCategorySchema = z.object({
  id: z.number().optional(),
  icon: z
    .string({ message: 'An emoji is required' })
    .min(1, 'An emoji is required'),
  name: z
    .string({ message: 'Category name is required!' })
    .min(3, 'Category name must be at least 3 characters')
    .max(50, 'Category name must not exceed 50 characters'),
});

/* Transaction Schema */

export const TransactionSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({ message: 'Transaction name is required!' })
    .min(3, 'Transaction name must be at least 3 characters')
    .max(50, 'Transaction name must not exceed 50 characters'),
  amount: z.string(),
  categoryId: z.number(),
  timestamp: z.date(),
  type: z.enum(['INCOME', 'EXPENSE']),
});
