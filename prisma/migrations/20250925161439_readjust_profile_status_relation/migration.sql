-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_statusId_fkey";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
