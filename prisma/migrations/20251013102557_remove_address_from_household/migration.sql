/*
  Warnings:

  - You are about to drop the column `addressId` on the `Household` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_addressId_fkey";

-- DropIndex
DROP INDEX "Household_addressId_key";

-- AlterTable
ALTER TABLE "Household" DROP COLUMN "addressId";
