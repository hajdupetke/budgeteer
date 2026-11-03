import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seed-categories';

const prisma = new PrismaClient();

seedCategories(prisma)
  .then(() => console.info('Default categories are ready.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
