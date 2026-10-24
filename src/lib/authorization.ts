import { auth } from './auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export type MutationErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_INPUT'
  | 'RECORD_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export type MutationResult =
  | { success: true }
  | { success: false; error: { code: MutationErrorCode; message: string; fieldErrors?: Record<string, string[]> } };

export class AuthenticationError extends Error {
  constructor() {
    super('Authentication required.');
  }
}

export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const id: unknown = session?.user?.id;
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new AuthenticationError();
  }
  return id;
};

export const categoryConnection = (id: number, userId: string) => ({
  id,
  OR: [{ userId }, { userId: null }],
});

export const runMutation = async (
  action: string,
  operation: (userId: string) => Promise<void>
): Promise<MutationResult> => {
  try {
    const userId = await requireUserId();
    await operation(userId);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: { code: 'UNAUTHENTICATED', message: error.message },
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: error.issues[0]?.message ?? 'Check the submitted fields.',
          fieldErrors: Object.fromEntries(Object.entries(error.flatten().fieldErrors).filter((entry): entry is [string, string[]] => !!entry[1])),
        },
      };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2025', 'P2018', 'P2015', 'P2003'].includes(error.code)
    ) {
      return {
        success: false,
        error: { code: 'RECORD_UNAVAILABLE', message: 'Requested record or category is unavailable.' },
      };
    }
    console.error('Mutation failed', {
      event: 'mutation_failed',
      action,
      errorCode: error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : 'UNEXPECTED_ERROR',
    });
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Unable to save changes. Please try again.' },
    };
  }
};
