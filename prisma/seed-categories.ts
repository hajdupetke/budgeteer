import { PrismaClient } from '@prisma/client';

const categories = [
  { name: 'Salary', icon: '💸' },
  { name: 'Housing', icon: '🏠' },
  { name: 'Food', icon: '🍕' },
  { name: 'Transportation', icon: '🚎' },
  { name: 'Entertainment', icon: '🍿' },
] as const;

export async function seedCategories(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    // Older seeds assigned IDs explicitly, leaving the serial sequence behind.
    await tx.$queryRaw`
      SELECT setval(
        pg_get_serial_sequence('"TransactionCategory"', 'id'),
        GREATEST((SELECT COALESCE(MAX(id), 0) FROM "TransactionCategory"), 1),
        (SELECT COUNT(*) > 0 FROM "TransactionCategory")
      )
    `;

    for (const category of categories) {
      const existing = await tx.transactionCategory.findFirst({
        where: { name: category.name, userId: null },
      });
      if (!existing) await tx.transactionCategory.create({ data: category });
    }
  });
}
