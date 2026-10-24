import { z } from 'zod';

// Prisma Int identifiers are signed 32-bit integers.
export const RecordIdSchema = z.number().int().positive().max(2147483647);

export const parseCategoryId = (value: FormDataEntryValue | null) =>
  RecordIdSchema.parse(Number(z.string().parse(value)));

export const parseBudgetCategoryIds = (value: FormDataEntryValue | null) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(z.string().parse(value));
  } catch {
    throw new z.ZodError([
      { code: 'custom', path: ['categoryIds'], message: 'Invalid categories.' },
    ]);
  }
  const ids = z.array(RecordIdSchema).min(1).parse(parsed);
  return [...new Set(ids)];
};

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
  amount: z.coerce.number().min(0.01, 'Transaction amount cannot be 0.'),
  categoryId: z.number().min(1, 'Transaction must have category').nullable(),
  timestamp: z
    .date({ required_error: 'Transaction must have a time' })
    .refine((date) => date >= new Date('1900-01-01') && date <= new Date(), {
      message: 'Transaction date is incorrect, either too young or too old.',
    }),
  type: z.enum(['INCOME', 'EXPENSE']),
});

/* Budget Schema */

export const BudgetSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({ message: 'Budget name is required!' })
    .min(3, 'Budget name must be at least 3 characters')
    .max(50, 'Budget name must not exceed 50 characters'),
  max: z.coerce.number().min(0.01, 'Budget amount must be bigger than 0.'),
  categoryIds: z
    .array(z.number())
    .min(1, 'Budget must have at least 1 category'),
});


/* Read inputs: callers cannot supply Prisma query options. */

export const EmptyReadSchema = z.object({}).strict();
export const PageSchema = z.number().int().min(1).max(1000000);
export const paginationSchema = (defaultSize: number) => z.object({
  page: PageSchema.default(1),
  pageSize: z.number().int().min(1).max(100).default(defaultSize),
}).strict();

export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
}).strict().refine(({ start, end }) => start <= end, {
  message: 'The start date must not follow the end date.',
});
export type DateRange = z.infer<typeof DateRangeSchema>;
export const ReportReadSchema = z.object({ range: DateRangeSchema.optional() }).strict();
export type ReportReadInput = z.input<typeof ReportReadSchema>;
export type PageInput = { page?: number; pageSize?: number };

export const normalizePage = (value: unknown) => {
  const parsed = PageSchema.safeParse(
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  );
  return parsed.success ? parsed.data : 1;
};

const ReportDateParamSchema = z.string().datetime({ offset: true }).or(z.string().date());
const ReportUrlSchema = z.object({
  startDate: ReportDateParamSchema.optional(),
  endDate: ReportDateParamSchema.optional(),
}).strict().transform(({ startDate, endDate }) => ({
  range: startDate === undefined && endDate === undefined
    ? undefined
    : { start: new Date(startDate ?? ''), end: new Date(endDate ?? '') },
})).pipe(ReportReadSchema);

export const parseReportDateRange = (startDate: unknown, endDate: unknown) =>
  ReportUrlSchema.safeParse({ startDate, endDate });
