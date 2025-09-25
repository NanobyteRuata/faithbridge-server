/*
  Warnings:

  - Made the column `profileId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileId" SET NOT NULL;
