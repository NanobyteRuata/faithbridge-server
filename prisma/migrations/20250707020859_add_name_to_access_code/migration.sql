/*
  Warnings:

  - A unique constraint covering the columns `[profileId,relatedProfileId]` on the table `Relationship` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccessCode" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_profileId_relatedProfileId_key" ON "Relationship"("profileId", "relatedProfileId");
