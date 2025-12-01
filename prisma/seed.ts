import { AccessCode, Organization, Permission, PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { PERMISSION_DESCRIPTION } from '../src/shared/constants/permissions.constant';

dotenv.config();
const prisma = new PrismaClient();

async function createSuperAdmin(): Promise<User> {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@faithbridge.com';
  const phone = process.env.SUPER_ADMIN_PHONE ?? '09123123123';
  const username = process.env.SUPER_ADMIN_USERNAME ?? 'superadmin';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'superadmin';

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
      password: hashedPassword,
      isSuperAdmin: true,
      isActive: true,
      profileId: superAdminProfile.id,
    },
  });

  console.log('✅ Super admin created:', superAdmin);
  return superAdmin;
}

async function createOrganization(superAdmin: User): Promise<Organization> {
  const organization = await prisma.organization.create({
    data: {
      name: process.env.ORG_NAME ?? 'Test Org',
      code: process.env.ORG_CODE ?? 'TSTORG',
      createdById: superAdmin.id,
      updatedById: superAdmin.id,
    },
  });

  console.log('✅ Organization created:', organization);
  return organization;
}

async function createOrganizationPermissions(organizationId: number, superAdmin: User): Promise<Permission[]> {
  const createPermissionList = Object.entries(PERMISSION_DESCRIPTION).map(([permission, description]) => {
    return { permission, description, organizationId, createdById: superAdmin.id, updatedById: superAdmin.id };
  });

  const permissions = await prisma.permission.createManyAndReturn({
    data: createPermissionList,
  });
  console.log('✅ Permissions created.', permissions);

  return permissions;
}

async function createOrgAdminRole(organizationId: number, superAdmin: User, permissions: Permission[]): Promise<Role> {
  const role = prisma.role.create({
    data: {
      organizationId,
      name: process.env.ORG_ADMIN_ROLE_NAME ?? 'Org Admin Role',
      isOwner: true,
      permissions: { connect: permissions },
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    },
  });

  console.log('✅ Role created.', role);
  return role;
}

async function createOrgAdmin(
  organizationId: number,
  superAdmin: User,
  role: Role,
): Promise<User> {
  const email = process.env.ORG_ADMIN_EMAIL ?? 'orgadmin@faithbridge.com';
  const phone = process.env.ORG_ADMIN_PHONE ?? '09123123123';
  const username = process.env.ORG_ADMIN_USERNAME ?? 'orgadmin';
  const password = process.env.ORG_ADMIN_PASSWORD ?? 'orgadmin';

  const existing = await prisma.user.findUnique({
    where: { email_organizationId: { email, organizationId } },
  });

  if (existing) {
    console.log('✅ Org admin already exists.');
    return existing;
  }

  const profile = await prisma.profile.create({
    data: { title: 'Mr.', name: 'Org Admin', organizationId },
  });
  const hashedPassword = await bcrypt.hash(password, 10);

  const orgAdmin = await prisma.user.create({
    data: {
      organization: { connect: { id: organizationId } },
      profile: { connect: { id: profile.id } },
      email,
      password: hashedPassword,
      role: { connect: role },
      createdBy: { connect: { id: superAdmin.id } },
      updatedBy: { connect: { id: superAdmin.id } },
    },
  });

  console.log('✅ Org admin created:', orgAdmin);
  return orgAdmin;
}

async function createLocationData(organizationId: number) {
  const countries = [
    {
      name: 'Myanmar',
      states: [
        {
          name: 'Yangon',
          cities: [
            {
              name: 'Yangon',
              townships: [
                {
                  name: 'Pabedan'
                },
                {
                  name: 'Kyauktada'
                }
              ]
            },
            {
              name: 'Thanlyin',
              townships: [
                {
                  name: 'Thanlyin'
                },
                {
                  name: 'Kyauktan'
                },
                {
                  name: 'Thongwa'
                }
              ]
            }
          ]
        },
        {
          name: 'Mandalay',
          cities: [
            {
              name: 'Mandalay',
              townships: [
                {
                  name: 'Maha Aungmye'
                },
                {
                  name: 'Myingyan'
                }
              ]
            },
            {
              name: 'Pyinoolwin',
              townships: [
                {
                  name: 'Maymyo'
                },
                {
                  name: 'Thabeikkyin'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Thailand',
      states: [
        {
          name: 'Bangkok',
          cities: [
            {
              name: 'Bangkok',
              townships: [
                {
                  name: 'Watthana'
                },
                {
                  name: 'Khlong Toei'
                }
              ]
            }
          ]
        },
        {
          name: 'Chiang Mai',
          cities: [
            {
              name: 'Chiang Mai',
              townships: [
                {
                  name: 'Nimmanhaemin'
                },
                {
                  name: 'Chaiyaphum'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  for (const countryData of countries) {
    // Create country
    const country = await prisma.country.create({
      data: {
        name: countryData.name,
        organizationId,
      },
    });

    console.log(`✅ Country created: ${country.name}`);

    // Create states for this country
    for (const stateData of countryData.states) {
      const state = await prisma.state.create({
        data: {
          name: stateData.name,
          countryId: country.id,
          organizationId,
        },
      });

      console.log(`  ✅ State created: ${state.name}`);

      // Create cities for this state
      for (const cityData of stateData.cities) {
        const city = await prisma.city.create({
          data: {
            name: cityData.name,
            stateId: state.id,
            organizationId,
          },
        });

        console.log(`    ✅ City created: ${city.name}`);

        // Create townships for this city
        for (const townshipData of cityData.townships) {
          const township = await prisma.township.create({
            data: {
              name: townshipData.name,
              cityId: city.id,
              organizationId,
            },
          });

          console.log(`      ✅ Township created: ${township.name}`);
        }
      }
    }
  }

  console.log('✅ All location data created successfully.');
}

async function createOrgUserRole(organizationId: number, superAdmin: User): Promise<Role> {
  const role = prisma.role.create({
    data: {
      organizationId,
      name: process.env.ORG_USER_ROLE_NAME ?? 'Org User Role',
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    },
  });

  console.log('✅ User Role created.', role);
  return role;
}

async function createOrgUser(
  organizationId: number,
  orgAdmin: User,
  role: Role,
): Promise<User> {
  const email = process.env.ORG_USER_EMAIL ?? 'orguser@faithbridge.com';
  const phone = process.env.ORG_USER_PHONE ?? '09123123123';
  const username = process.env.ORG_USER_USERNAME ?? 'orguser';
  const password = process.env.ORG_USER_PASSWORD ?? 'orguser';

  const existing = await prisma.user.findUnique({
    where: { email_organizationId: { email, organizationId } },
  });

  if (existing) {
    console.log('✅ Org user already exists.');
    return existing;
  }

  const profile = await prisma.profile.create({
    data: { title: 'Mr.', name: 'Org User', organizationId },
  });
  const hashedPassword = await bcrypt.hash(password, 10);

  const orgUser = await prisma.user.create({
    data: {
      organization: { connect: { id: organizationId } },
      profile: { connect: { id: profile.id } },
      email,
      password: hashedPassword,
      role: { connect: role },
      createdBy: { connect: { id: orgAdmin.id } },
      updatedBy: { connect: { id: orgAdmin.id } },
    },
  });

  console.log('✅ Org user created:', orgUser);
  return orgUser;
}

async function createOrgAccessKey(organizationId: number, superAdmin: User, allPermissions: Permission[]): Promise<AccessCode> {
  const role = await prisma.role.create({
    data: {
      organizationId,
      name: process.env.ORG_ACCESS_KEY_ROLE_NAME ?? 'Org Access Key Role',
      createdById: superAdmin.id,
      updatedById: superAdmin.id
    },
  });
  
  const accessKey = await prisma.accessCode.create({
    data: {
      name: 'Org Access Key',
      code: '123456',
      isActive: true,
      role: { connect: role },
      organization: { connect: { id: organizationId } },
      createdBy: { connect: { id: superAdmin.id } },
      updatedBy: { connect: { id: superAdmin.id } },
    },
  });

  console.log('✅ Org access key created:', accessKey);
  return accessKey;
}

async function main() {
  const superAdmin = await createSuperAdmin();
  const organization = await createOrganization(superAdmin);
  await createLocationData(organization.id);
  const allPermissions = await createOrganizationPermissions(organization.id, superAdmin);
  const orgAdminRole = await createOrgAdminRole(organization.id, superAdmin, allPermissions);
  const orgAdmin = await createOrgAdmin(organization.id, superAdmin, orgAdminRole);
  const orgUserRole = await createOrgUserRole(organization.id, orgAdmin);
  const orgUser = await createOrgUser(organization.id, orgAdmin, orgUserRole);
  const orgAccessKey = await createOrgAccessKey(organization.id, superAdmin, allPermissions);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
