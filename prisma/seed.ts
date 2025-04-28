import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const categories = [
    {
      id: 1,
      icon: '💸',
      name: 'Salary',
    },
    {
      id: 2,
      icon: '🏠',
      name: 'Housing',
    },
    {
      id: 3,
      icon: '🍕',
      name: 'Food',
    },
    {
      id: 4,
      icon: '🚎',
      name: 'Transportation',
    },
    {
      id: 5,
      icon: '🍿',
      name: 'Entertainment',
    },
  ];

  categories.forEach(async (category) => {
    const created = await prisma.transactionCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
    console.log(created);
  });
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
