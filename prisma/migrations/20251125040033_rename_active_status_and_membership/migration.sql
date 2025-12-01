/*
  Warnings:

  - You are about to drop the column `isActiveMembership` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `isActiveStatus` on the `Status` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "isActiveMembership",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "isActiveStatus",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
