/*
  Warnings:

  - You are about to drop the column `profileId` on the `Address` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[addressId]` on the table `Household` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_addressId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "profileId";

-- AlterTable
ALTER TABLE "Household" ALTER COLUMN "addressId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_AddressToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AddressToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AddressToProfile_B_index" ON "_AddressToProfile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Household_addressId_key" ON "Household"("addressId");

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToProfile" ADD CONSTRAINT "_AddressToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToProfile" ADD CONSTRAINT "_AddressToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
