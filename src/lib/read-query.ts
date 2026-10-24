import 'server-only';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from './db';
import { MAX_READ_RESULTS } from './validation';

export class ReadError extends Error {
  constructor(
    public readonly code: 'INVALID_INPUT' | 'RESULT_LIMIT_EXCEEDED' | 'READ_TIMEOUT',
    message: string,
    public readonly fieldErrors: Record<string, string[] | undefined> = {}
  ) { super(message); }
}
export const parseReadInput = <S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> => {
  const result = schema.safeParse(input);
  if (!result.success) throw new ReadError('INVALID_INPUT', result.error.issues[0]?.message ?? 'Invalid input.', result.error.flatten().fieldErrors);
  return result.data;
};
export const checkResultLimit = <T>(rows: T[], label: string, limit = MAX_READ_RESULTS): T[] => {
  if (rows.length > limit) throw new ReadError('RESULT_LIMIT_EXCEEDED', `Too many ${label} to load. Reduce the selection or manage the records before continuing.`);
  return rows;
};
export const runReadQuery = async <T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
  try {
    return await db.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL statement_timeout = '5s'`;
      return operation(tx);
    }, { timeout: 10000, maxWait: 5000 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (
      ['P2028', 'P2024'].includes(error.code) || error.meta?.code === '57014'
    )) throw new ReadError('READ_TIMEOUT', 'This query took too long. Select a smaller date range or page.');
    if (error instanceof Prisma.PrismaClientUnknownRequestError && error.message.includes('57014')) {
      throw new ReadError('READ_TIMEOUT', 'This query took too long. Select a smaller date range or page.');
    }
    throw error;
  }
};
