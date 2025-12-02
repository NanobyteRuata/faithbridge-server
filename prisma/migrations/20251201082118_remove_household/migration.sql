/*
  Warnings:

  - You are about to drop the column `householdId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Household` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_headProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_householdId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "householdId";

-- DropTable
DROP TABLE "Household";
