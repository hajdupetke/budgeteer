import type { TransactionType } from '@prisma/client';

export type TransactionWithCategory = {
  id: number;
  name: string;
  amount: number;
  timestamp: Date;
  type: TransactionType;
  categoryId: number | null;
  category: { icon: string } | null;
};
