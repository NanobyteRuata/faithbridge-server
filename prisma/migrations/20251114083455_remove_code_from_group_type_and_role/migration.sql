/*
  Warnings:

  - You are about to drop the column `code` on the `GroupRole` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `GroupType` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GroupRole_code_groupTypeId_key";

-- DropIndex
DROP INDEX "GroupType_code_organizationId_key";

-- AlterTable
ALTER TABLE "GroupRole" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "GroupType" DROP COLUMN "code";
