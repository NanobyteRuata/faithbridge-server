/*
  Warnings:

  - You are about to drop the column `householdId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Household` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_headProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Household" DROP CONSTRAINT "Household_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_householdId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "householdId";

-- DropTable
DROP TABLE "Household";

-- CreateTable
CREATE TABLE "GroupType" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRole" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "groupTypeId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileGroup" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupTypeId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileGroupMember" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "groupRoleId" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupType_code_organizationId_key" ON "GroupType"("code", "organizationId");

-- CreateIndex
CREATE INDEX "GroupRole_groupTypeId_idx" ON "GroupRole"("groupTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRole_code_groupTypeId_key" ON "GroupRole"("code", "groupTypeId");

-- CreateIndex
CREATE INDEX "ProfileGroup_groupTypeId_idx" ON "ProfileGroup"("groupTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileGroup_name_organizationId_key" ON "ProfileGroup"("name", "organizationId");

-- CreateIndex
CREATE INDEX "ProfileGroupMember_groupId_idx" ON "ProfileGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "ProfileGroupMember_groupRoleId_idx" ON "ProfileGroupMember"("groupRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileGroupMember_profileId_groupId_key" ON "ProfileGroupMember"("profileId", "groupId");

-- AddForeignKey
ALTER TABLE "GroupType" ADD CONSTRAINT "GroupType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupType" ADD CONSTRAINT "GroupType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupType" ADD CONSTRAINT "GroupType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_groupTypeId_fkey" FOREIGN KEY ("groupTypeId") REFERENCES "GroupType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRole" ADD CONSTRAINT "GroupRole_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroup" ADD CONSTRAINT "ProfileGroup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroup" ADD CONSTRAINT "ProfileGroup_groupTypeId_fkey" FOREIGN KEY ("groupTypeId") REFERENCES "GroupType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroup" ADD CONSTRAINT "ProfileGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroup" ADD CONSTRAINT "ProfileGroup_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ProfileGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_groupRoleId_fkey" FOREIGN KEY ("groupRoleId") REFERENCES "GroupRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGroupMember" ADD CONSTRAINT "ProfileGroupMember_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
