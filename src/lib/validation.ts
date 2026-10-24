import { z } from 'zod';

export const MAX_MONEY = '999999999.99';
export const MAX_CATEGORIES = 100;
export const MAX_READ_RESULTS = 1000;
export const RecordIdSchema = z.number().int().positive().max(2147483647);

const text = (min: number, max: number, label: string) => z.string().max(max * 4, `${label} input is too long.`).trim().refine(
  (value) => [...value].length >= min && [...value].length <= max,
  `${label} must contain ${min}–${max} characters.`
);
const NameSchema = text(3, 50, 'Name');
const IconSchema = text(1, 32, 'Icon');
export const MoneySchema = z.string().trim()
  .regex(/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/, `Enter a decimal amount up to ${MAX_MONEY} with at most two decimal places.`)
  .refine((value) => !/^0(?:\.0{1,2})?$/.test(value), 'Amount must be greater than zero.');
const TransactionDateSchema = z.date().refine(
  (date) => date >= new Date('1900-01-01T00:00:00Z') && date <= new Date(),
  'Date must be between 1900 and the current time.'
);
const CategoryIdsSchema = z.array(RecordIdSchema).min(1).max(MAX_CATEGORIES);

export const TransactionCategorySchema = z.object({
  id: RecordIdSchema.optional(), name: NameSchema, icon: IconSchema,
});
export const TransactionSchema = z.object({
  id: RecordIdSchema.optional(), name: NameSchema, amount: MoneySchema,
  categoryId: RecordIdSchema, timestamp: TransactionDateSchema,
  type: z.enum(['INCOME', 'EXPENSE']),
});
export const BudgetSchema = z.object({
  id: RecordIdSchema.optional(), name: NameSchema, max: MoneySchema,
  categoryIds: CategoryIdsSchema,
});

const FormIdSchema = z.string().regex(/^\d+$/, 'Choose a valid category.')
  .transform(Number).pipe(RecordIdSchema);
const CategoryJsonSchema = z.string().max(4096, 'Category selection is too large.')
  .transform((value, ctx): unknown => {
    try { return JSON.parse(value); } catch {
      ctx.addIssue({ code: 'custom', message: 'Category selection must be valid JSON.' });
      return z.NEVER;
    }
  }).pipe(CategoryIdsSchema).transform((ids) => [...new Set(ids)]);

// Ignore unrelated fields, but reject ambiguous duplicate known fields.
const formFields = (input: unknown, fields: Record<string, string>) => {
  const form = z.instanceof(FormData, { message: 'Expected form data.' }).parse(input);
  const result: Record<string, unknown> = {};
  const issues: z.ZodIssue[] = [];
  for (const [field, wireName] of Object.entries(fields)) {
    const values = form.getAll(wireName);
    if (values.length > 1) issues.push({ code: 'custom', path: [field], message: 'Submit this field only once.' });
    result[field] = values[0];
  }
  if (issues.length) throw new z.ZodError(issues);
  return result;
};

export const parseCategoryForm = (input: unknown) => TransactionCategorySchema.omit({ id: true })
  .parse(formFields(input, { name: 'name', icon: 'icon' }));
export const parseTransactionForm = (input: unknown) => TransactionSchema.omit({ id: true }).extend({
  categoryId: FormIdSchema,
  timestamp: z.string().datetime({ offset: true, message: 'Submit a valid ISO timestamp.' })
    .transform((value) => new Date(value)).pipe(TransactionDateSchema),
}).parse(formFields(input, {
  name: 'name', amount: 'amount', categoryId: 'categoryId', timestamp: 'timestamp', type: 'transactionType',
}));
export const parseBudgetForm = (input: unknown) => BudgetSchema.omit({ id: true })
  .extend({ categoryIds: CategoryJsonSchema })
  .parse(formFields(input, { name: 'name', max: 'max', categoryIds: 'categoryIds' }));

export const EmptyReadSchema = z.object({}).strict();
export const PageSchema = z.number().int().min(1).max(1000000);
export const paginationSchema = (defaultSize: number) => z.object({
  page: PageSchema.default(1), pageSize: z.number().int().min(1).max(100).default(defaultSize),
}).strict();

// Calendar limits use UTC and clamp leap-day anniversaries to the target month.
export const shiftUtcYears = (date: Date, years: number) => {
  const shifted = new Date(date);
  const month = shifted.getUTCMonth();
  shifted.setUTCFullYear(shifted.getUTCFullYear() + years);
  if (shifted.getUTCMonth() !== month) shifted.setUTCDate(0);
  return shifted;
};
export const defaultReportRange = (now = new Date()) => ({ start: shiftUtcYears(now, -1), end: new Date(now) });
const ReportDateSchema = z.date()
  .min(new Date('1900-01-01T00:00:00Z'), 'Report dates must be on or after 1900.')
  .max(new Date('9999-12-31T23:59:59.999Z'), 'Report dates must not exceed year 9999.');
export const DateRangeSchema = z.object({ start: ReportDateSchema, end: ReportDateSchema }).strict()
  .refine(({ start, end }) => start <= end, { message: 'The start date must not follow the end date.' })
  .refine(({ start, end }) => end <= shiftUtcYears(start, 5), { message: 'Select a report range of at most five years.' });
export type DateRange = z.infer<typeof DateRangeSchema>;
export const CountReadSchema = z.object({ range: DateRangeSchema.optional() }).strict();
export const ReportReadSchema = CountReadSchema.transform(({ range }) => ({ range: range ?? defaultReportRange() }));
export type ReportReadInput = z.input<typeof ReportReadSchema>;
export type PageInput = { page?: number; pageSize?: number };
export const normalizePage = (value: unknown) => {
  const parsed = PageSchema.safeParse(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value);
  return parsed.success ? parsed.data : 1;
};
const ReportDateParamSchema = z.string().datetime({ offset: true }).or(z.string().date());
const ReportUrlSchema = z.object({
  startDate: ReportDateParamSchema.optional(), endDate: ReportDateParamSchema.optional(),
}).strict().transform(({ startDate, endDate }) => ({
  range: startDate === undefined && endDate === undefined ? undefined
    : { start: new Date(startDate ?? ''), end: new Date(endDate ?? '') },
})).pipe(ReportReadSchema);
export const parseReportDateRange = (startDate: unknown, endDate: unknown) =>
  ReportUrlSchema.safeParse({ startDate, endDate });
