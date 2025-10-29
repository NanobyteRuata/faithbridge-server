/*
  Warnings:

  - You are about to drop the column `cityId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Address` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,stateId]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,countryId]` on the table `State` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,cityId]` on the table `Township` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `State` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Township` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_stateId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "cityId",
DROP COLUMN "countryId",
DROP COLUMN "stateId",
DROP COLUMN "zip";

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Township" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "City_name_stateId_key" ON "City"("name", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_organizationId_key" ON "Country"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_countryId_key" ON "State"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Township_name_cityId_key" ON "Township"("name", "cityId");

-- AddForeignKey
ALTER TABLE "Township" ADD CONSTRAINT "Township_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
