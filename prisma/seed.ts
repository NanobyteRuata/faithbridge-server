import { Organization, PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function createSuperAdmin(): Promise<User> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const phone = process.env.SUPER_ADMIN_PHONE;
  const username = process.env.SUPER_ADMIN_USERNAME;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !phone || !username || !password) {
    throw new Error('❌ Some required ENVs not found');
  }

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { email, isSuperAdmin: true },
  });

  if (existing) {
    console.log('✅ Super admin already exists.');
    return existing;
  }

  const superAdminProfile = await prisma.profile.create({
    data: {
      title: 'Mr.',
      name: process.env.SUPER_ADMIN_NAME ?? 'Admin',
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email,
      phone,
      username,
      password: hashedPassword,
      isSuperAdmin: true,
      isActive: true,
      profileId: superAdminProfile.id,
    },
  });

  console.log('✅ Super admin created:', superAdmin);
  return superAdmin;
}

async function createOrganization(): Promise<Organization> {
  const organization = await prisma.organization.create({ data: { name: 'Test Org', code: 'TSTORG' } });

  console.log('✅ Organization created:', organization);
  return organization;
}

async function createOrgAdmin(
  orgaizationId: number,
  superAdmin: User,
): Promise<User> {
  const email = 'orgadmin@faithbridge.com';
  const phone = '09123123123';
  const username = 'orgadmin';
  const password = 'orgadmin';

  const profile = await prisma.profile.create({
    data: { title: 'Mr.', name: 'Org Admin' },
  });
  const hashedPassword = await bcrypt.hash(password, 10);

  const orgAdmin = await prisma.user.create({
    data: {
      organization: { connect: { id: orgaizationId } },
      profile: { connect: { id: profile.id } },
      email,
      phone,
      password: hashedPassword,
      username,
      createdBy: { connect: { id: superAdmin.id } },
      updatedBy: { connect: { id: superAdmin.id } }
    },
  });

  return orgAdmin;
}

async function main() {
  const superAdmin = await createSuperAdmin();
  const organization = await createOrganization();
  await createOrgAdmin(organization.id, superAdmin);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
