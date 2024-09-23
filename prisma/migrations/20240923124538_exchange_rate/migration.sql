/*
  Warnings:

  - You are about to drop the column `from` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `ExchangeRate` table. All the data in the column will be lost.
  - Added the required column `currency` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExchangeRate" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "currency" "Currency" NOT NULL;
