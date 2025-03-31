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

type PrimsaReportTransactions = Prisma.TransactionGetPayload<{
  include: {
    category: true;
  };
}>;

export type ReportTransactions = Omit<PrimsaReportTransactions, 'amount'> & {
  amount: number;
};
