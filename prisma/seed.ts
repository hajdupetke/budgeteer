import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const categories = await prisma.transactionCategory.createManyAndReturn({
    data: [
      {
        icon: '💸',
        name: 'Salary',
      },
      {
        icon: '🏠',
        name: 'Housing',
      },
      {
        icon: '🍕',
        name: 'Food',
      },
      {
        icon: '🚎',
        name: 'Transportation',
      },
      {
        icon: '🍿',
        name: 'Entertainment',
      },
    ],
  });

  console.log(categories);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
