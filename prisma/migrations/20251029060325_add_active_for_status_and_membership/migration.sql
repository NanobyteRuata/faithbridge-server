/*
  Warnings:

  - You are about to drop the column `workPhone` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "isActiveMembership" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "workPhone",
ADD COLUMN     "homePhone" TEXT;

-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "isActiveStatus" BOOLEAN NOT NULL DEFAULT true;
