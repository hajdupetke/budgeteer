import { z } from 'zod';

export class InputError extends Error {}

export const RecordIdSchema = z.number().int().positive().safe();
const name = z.string({ required_error: 'Enter a name.', invalid_type_error: 'Enter a name.' }).trim().min(3, 'Name must be at least 3 characters.').max(50, 'Name must not exceed 50 characters.');
export const MoneySchema = z.string({ required_error: 'Enter an amount.', invalid_type_error: 'Enter an amount.' }).trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter an amount with at most two decimal places.')
  .refine((value) => /[1-9]/.test(value), 'Amount must be greater than zero.')
  .refine((value) => Number.isFinite(Number(value)), 'Amount is too large.');

export const TransactionCategorySchema = z.object({
  id: z.number().optional(),
  icon: z.string({ invalid_type_error: 'Choose an emoji.' }).trim().min(1, 'An emoji is required.').max(50),
  name,
});

export const TransactionSchema = z.object({
  id: z.number().optional(),
  name,
  amount: MoneySchema,
  categoryId: RecordIdSchema.nullable(),
  timestamp: z.date({ required_error: 'Choose a transaction date.' }).refine(
    (date) => date >= new Date('1900-01-01') && date <= new Date(),
    'Transaction date must be between 1900 and now.'
  ),
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'Choose income or expense.' }),
});

export const BudgetSchema = z.object({
  id: z.number().optional(),
  name,
  max: MoneySchema,
  categoryIds: z.array(RecordIdSchema, { invalid_type_error: 'Select valid budget categories.', required_error: 'Select budget categories.' }).min(1, 'Select at least one category.'),
});

// FormData is untrusted, including fields normally supplied by our own forms.
export function transactionInput(data: FormData) {
  const category = data.get('categoryId');
  const timestamp = data.get('timestamp');
  return TransactionSchema.parse({
    name: data.get('name'), amount: data.get('amount'),
    categoryId: category === '' || category === null ? null : Number(category),
    timestamp: new Date(z.string({ invalid_type_error: 'Choose a transaction date and time.' }).datetime({ offset: true, message: 'Choose a valid transaction date and time.' }).parse(timestamp)),
    type: data.get('transactionType'),
  });
}

export function budgetInput(data: FormData) {
  const raw = data.get('categoryIds');
  let categoryIds: unknown;
  try {
    categoryIds = typeof raw === 'string' ? JSON.parse(raw) : undefined;
  } catch {
    throw new InputError('Select valid budget categories.');
  }
  return BudgetSchema.parse({ name: data.get('name'), max: data.get('max'), categoryIds });
}
