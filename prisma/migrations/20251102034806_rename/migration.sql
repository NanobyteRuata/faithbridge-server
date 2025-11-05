/*
  Warnings:

  - You are about to drop the `ProfileGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProfileGroupMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfileGroup" DROP CONSTRAINT "ProfileGroup_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroup" DROP CONSTRAINT "ProfileGroup_groupTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroup" DROP CONSTRAINT "ProfileGroup_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroup" DROP CONSTRAINT "ProfileGroup_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_groupRoleId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGroupMember" DROP CONSTRAINT "ProfileGroupMember_updatedById_fkey";

-- DropTable
DROP TABLE "ProfileGroup";

-- DropTable
DROP TABLE "ProfileGroupMember";

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupTypeId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupProfile" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "groupRoleId" INTEGER,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Group_groupTypeId_idx" ON "Group"("groupTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_organizationId_key" ON "Group"("name", "organizationId");

-- CreateIndex
CREATE INDEX "GroupProfile_groupId_idx" ON "GroupProfile"("groupId");

-- CreateIndex
CREATE INDEX "GroupProfile_groupRoleId_idx" ON "GroupProfile"("groupRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupProfile_profileId_groupId_key" ON "GroupProfile"("profileId", "groupId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_groupTypeId_fkey" FOREIGN KEY ("groupTypeId") REFERENCES "GroupType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_groupRoleId_fkey" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupProfile" ADD CONSTRAINT "GroupProfile_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
