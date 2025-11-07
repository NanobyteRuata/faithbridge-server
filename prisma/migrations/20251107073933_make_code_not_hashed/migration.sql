/*
  Warnings:

  - You are about to drop the column `hashedCode` on the `AccessCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,organizationId]` on the table `AccessCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccessCode_hashedCode_key";

-- DropIndex
DROP INDEX "AccessCode_hashedCode_organizationId_key";

-- AlterTable
ALTER TABLE "AccessCode" DROP COLUMN "hashedCode",
ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_organizationId_key" ON "AccessCode"("code", "organizationId");
