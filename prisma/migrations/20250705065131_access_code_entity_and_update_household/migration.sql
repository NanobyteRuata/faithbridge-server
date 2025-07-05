/*
  Warnings:

  - You are about to drop the column `fromDate` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `Household` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `Household` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[headProfileId]` on the table `Household` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `RelationshipType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `RelationshipType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RelationshipType_name_key";

-- AlterTable
ALTER TABLE "Household" DROP COLUMN "fromDate",
DROP COLUMN "isCurrent",
DROP COLUMN "toDate",
ADD COLUMN     "headProfileId" INTEGER;

-- AlterTable
ALTER TABLE "RelationshipType" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "isBidirectional" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" SERIAL NOT NULL,
    "hashedCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessCodeToPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AccessCodeToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_hashedCode_key" ON "AccessCode"("hashedCode");

-- CreateIndex
CREATE INDEX "_AccessCodeToPermission_B_index" ON "_AccessCodeToPermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Household_headProfileId_key" ON "Household"("headProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipType_code_key" ON "RelationshipType"("code");

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_headProfileId_fkey" FOREIGN KEY ("headProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessCodeToPermission" ADD CONSTRAINT "_AccessCodeToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessCodeToPermission" ADD CONSTRAINT "_AccessCodeToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
