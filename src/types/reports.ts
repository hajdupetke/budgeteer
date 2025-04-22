import { Prisma } from '@prisma/client';

export type CategoryChartConfig = {
  category: {
    label: string;
  };
} & {
  [key: string]: {
    label?: string;
    color?: string;
  };
};

export type CategoryChartData = {
  category: string;
  sum: number;
  //fill: string;
};

export type PrismaExpensesByCategory = Prisma.GetTransactionGroupByPayload<{
  by: ['categoryId'];
  _sum: {
    amount: true;
  };
}>;
