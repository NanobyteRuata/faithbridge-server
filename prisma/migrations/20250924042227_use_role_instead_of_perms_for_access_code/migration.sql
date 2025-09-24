/*
  Warnings:

  - You are about to drop the `_AccessCodeToPermission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roleId` to the `AccessCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AccessCodeToPermission" DROP CONSTRAINT "_AccessCodeToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessCodeToPermission" DROP CONSTRAINT "_AccessCodeToPermission_B_fkey";

-- AlterTable
ALTER TABLE "AccessCode" ADD COLUMN     "roleId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_AccessCodeToPermission";

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
