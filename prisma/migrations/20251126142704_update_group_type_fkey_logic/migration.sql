-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_groupTypeId_fkey";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupTypeId_fkey" FOREIGN KEY ("groupTypeId") REFERENCES "GroupType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
