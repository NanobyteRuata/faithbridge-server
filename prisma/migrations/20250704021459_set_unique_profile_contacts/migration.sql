/*
  Warnings:

  - A unique constraint covering the columns `[profileId,contactTypeId,value]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,email]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,phone]` on the table `Phone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_profileId_contactTypeId_value_key" ON "Contact"("profileId", "contactTypeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Email_profileId_email_key" ON "Email"("profileId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_profileId_phone_key" ON "Phone"("profileId", "phone");
