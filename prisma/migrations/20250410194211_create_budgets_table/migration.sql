-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "max" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BudgetToTransactionCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BudgetToTransactionCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BudgetToTransactionCategory_B_index" ON "_BudgetToTransactionCategory"("B");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BudgetToTransactionCategory" ADD CONSTRAINT "_BudgetToTransactionCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BudgetToTransactionCategory" ADD CONSTRAINT "_BudgetToTransactionCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TransactionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
