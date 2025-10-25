/*
  Warnings:

  - You are about to drop the column `action` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[permission,organizationId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permission` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_action_resource_organizationId_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "action",
DROP COLUMN "resource",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "permission" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permission_organizationId_key" ON "Permission"("permission", "organizationId");
