/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Membership_name_key" ON "Membership"("name");
