import { Organization, PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { PERMISSIONS } from '../src/shared/constants/permissions.constant';

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

async function createOrgAdminRole(organizationId: number): Promise<Role> {
  const actionResourceList = Object.values(PERMISSIONS).map(permission => {
    const [ resource, action ] = permission.split('__');
    return { resource, action, organizationId }
  });

  const permissions = await prisma.permission.createManyAndReturn({ data: actionResourceList });
  console.log('✅ Permissions created.', permissions);

  const role = prisma.role.create({ data: { organizationId, name: 'Org Admin Role', permissions: { connect: permissions } } });
  
  console.log('✅ Role created.', role);
  return role;
}

async function createOrgAdmin(
  organizationId: number,
  superAdmin: User,
  role: Role
): Promise<User> {
  const email = 'orgadmin@faithbridge.com';
  const phone = '09123123123';
  const username = 'orgadmin';
  const password = 'orgadmin';

  const existing = await prisma.user.findUnique({ where: { email_organizationId: { email, organizationId } } });

  if (existing) {
    console.log('✅ Org admin already exists.');
    return existing;
  }

  const profile = await prisma.profile.create({
    data: { title: 'Mr.', name: 'Org Admin' },
  });
  const hashedPassword = await bcrypt.hash(password, 10);

  const orgAdmin = await prisma.user.create({
    data: {
      organization: { connect: { id: organizationId } },
      profile: { connect: { id: profile.id } },
      email,
      phone,
      password: hashedPassword,
      username,
      role: { connect: role },
      createdBy: { connect: { id: superAdmin.id } },
      updatedBy: { connect: { id: superAdmin.id } }
    },
  });

  console.log('✅ Org admin created:', superAdmin);
  return orgAdmin;
}

async function main() {
  const superAdmin = await createSuperAdmin();
  const organization = await createOrganization();
  const orgAdminRole = await createOrgAdminRole(organization.id);
  await createOrgAdmin(organization.id, superAdmin, orgAdminRole);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
