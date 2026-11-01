import { PrismaClient, TransactionType } from '@prisma/client';
import { DEMO_EMAIL, DEMO_USER_ID } from '../src/lib/demo';
import { seedCategories } from './seed-categories';

const prisma = new PrismaClient();

async function main() {
  await seedCategories(prisma);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const [byId, byEmail] = await Promise.all([
      tx.user.findUnique({ where: { id: DEMO_USER_ID } }),
      tx.user.findUnique({ where: { email: DEMO_EMAIL } }),
    ]);
    if ((byId && byId.email !== DEMO_EMAIL) || (byEmail && byEmail.id !== DEMO_USER_ID)) {
      throw new Error('The reserved demo account conflicts with an existing user.');
    }

    await tx.user.upsert({
      where: { id: DEMO_USER_ID },
      update: { name: 'Budgeteer Demo' },
      create: { id: DEMO_USER_ID, email: DEMO_EMAIL, name: 'Budgeteer Demo' },
    });
    await tx.transaction.deleteMany({ where: { userId: DEMO_USER_ID } });
    await tx.budget.deleteMany({ where: { userId: DEMO_USER_ID } });

    const categories = await tx.transactionCategory.findMany({
      where: { userId: null, name: { in: ['Salary', 'Housing', 'Food', 'Transportation', 'Entertainment'] } },
      orderBy: { id: 'asc' },
    });
    const categoryId = (name: string) => {
      const category = categories.find((item) => item.name === name);
      if (!category) throw new Error(`Missing demo category: ${name}`);
      return category.id;
    };

    for (const offset of [-2, -1, 0]) {
      const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
      const day = (requested: number) => new Date(Date.UTC(
        month.getUTCFullYear(), month.getUTCMonth(),
        offset === 0 ? Math.min(requested, now.getUTCDate()) : requested,
        0,
      ));
      const entries = [
        { name: 'Monthly salary', amount: '4200.00', type: TransactionType.INCOME, categoryId: categoryId('Salary'), timestamp: day(2) },
        { name: 'Apartment rent', amount: '1550.00', type: TransactionType.EXPENSE, categoryId: categoryId('Housing'), timestamp: day(3) },
        { name: 'Groceries', amount: offset === 0 ? '515.00' : '460.00', type: TransactionType.EXPENSE, categoryId: categoryId('Food'), timestamp: day(6) },
        { name: 'Transit pass', amount: '89.00', type: TransactionType.EXPENSE, categoryId: categoryId('Transportation'), timestamp: day(8) },
        { name: 'Cafe and lunch', amount: offset === 0 ? '190.00' : '135.00', type: TransactionType.EXPENSE, categoryId: categoryId('Food'), timestamp: day(12) },
        { name: 'Cinema and music', amount: '96.00', type: TransactionType.EXPENSE, categoryId: categoryId('Entertainment'), timestamp: day(17) },
      ];
      await tx.transaction.createMany({ data: entries.map((entry) => ({ ...entry, userId: DEMO_USER_ID })) });
    }

    for (const budget of [
      { name: 'Home', max: '1700.00', category: 'Housing' },
      { name: 'Food and coffee', max: '600.00', category: 'Food' },
      { name: 'Getting around', max: '150.00', category: 'Transportation' },
      { name: 'Fun', max: '120.00', category: 'Entertainment' },
    ]) {
      await tx.budget.create({
        data: {
          name: budget.name,
          max: budget.max,
          userId: DEMO_USER_ID,
          categories: { connect: { id: categoryId(budget.category) } },
        },
      });
    }
  });
  console.info('Fictional demo data is ready.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
