/*
  Warnings:

  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Email` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contactTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ContactType" DROP CONSTRAINT "ContactType_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ContactType" DROP CONSTRAINT "ContactType_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_profileId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "otherContact1" TEXT,
ADD COLUMN     "otherContact1Type" TEXT,
ADD COLUMN     "otherContact2" TEXT,
ADD COLUMN     "otherContact2Type" TEXT,
ADD COLUMN     "otherContact3" TEXT,
ADD COLUMN     "otherContact3Type" TEXT,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "personalPhone" TEXT,
ADD COLUMN     "workEmail" TEXT,
ADD COLUMN     "workPhone" TEXT;

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "ContactType";

-- DropTable
DROP TABLE "Email";

-- DropTable
DROP TABLE "Phone";
