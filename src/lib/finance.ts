// Budgeteer uses EUR and UTC calendar days throughout its reports.
const currencyFormatter = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export const formatMoney = (value: number | string) =>
  // Intl accepts exact decimal strings at runtime; TypeScript's signature only declares numbers.
  currencyFormatter.format(value as number);

export function percentageChange(current: number, previous: number) {
  return previous === 0 ? (current === 0 ? 0 : null) : ((current - previous) / previous) * 100;
}

export function parsePage(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export function clampPage(page: number, count: number, size: number) {
  return Math.min(Math.max(1, page), Math.max(1, Math.ceil(count / size)));
}

export function calendarDate(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Choose a valid date in YYYY-MM-DD format.');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (value.startsWith('0000-') || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Choose a valid calendar date.');
  }
  return date;
}

export type DateRange = { startDate?: string; endDate?: string };

export function dateBounds({ startDate, endDate }: DateRange = {}) {
  if (startDate === undefined && endDate === undefined) return undefined;
  if (startDate === undefined) throw new Error('Choose a start date.');
  const gte = calendarDate(startDate);
  const end = calendarDate(endDate ?? startDate);
  if (end < gte) throw new Error('The end date must be on or after the start date.');
  end.setUTCDate(end.getUTCDate() + 1);
  if (!Number.isFinite(end.getTime())) throw new Error('Choose a valid end date.');
  return { gte, lt: end };
}

export function monthRange(now = new Date(), offset = 0): Required<DateRange> {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 0));
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}
