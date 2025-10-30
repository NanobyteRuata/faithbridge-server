-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isHomePhonePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOtherContact1Public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOtherContact2Public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOtherContact3Public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPersonalEmailPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPersonalPhonePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isWorkEmailPublic" BOOLEAN NOT NULL DEFAULT true;
