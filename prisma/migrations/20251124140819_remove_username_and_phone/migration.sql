/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetCodeExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_phone_organizationId_key";

-- DropIndex
DROP INDEX "User_username_organizationId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
DROP COLUMN "resetCode",
DROP COLUMN "resetCodeExpiresAt",
DROP COLUMN "username",
ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetCodeExpiresAt" TIMESTAMP(3);
