import { Prisma } from '@prisma/client';

type PrismaTransactionWithCategory = Prisma.TransactionGetPayload<{
  include: {
    category: {
      select: {
        icon: true;
      };
    };
  };
}>;

export type TransactionWithCategory = Omit<
  PrismaTransactionWithCategory,
  'amount'
> & {
  amount: number;
};
