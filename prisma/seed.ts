import { Permission, PrismaClient } from '@prisma/client';
import { RESOURCE_ACTIONS } from '../src/shared/constants/actions.constant';
import { RESOURCES } from '../src/shared/constants/resources.constant';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding permissions...');
  
  const createdPermissions: Permission[] = [];
  // Create permissions for each resource-action pair
  for (const resource of Object.values(RESOURCES)) {
    for (const action of Object.values(RESOURCE_ACTIONS)) {
      const permission = await prisma.permission.upsert({
        where: { 
          action_resource: { 
            action: action,
            resource: resource
          }
        },
        update: {}, // No updates if exists
        create: {
          action: action,
          resource: resource,
          description: `Permission to ${action.toLowerCase()} ${resource.toLowerCase()}`
        }
      });
      createdPermissions.push(permission);
    }
  }
  
  console.log(`Created ${createdPermissions.length} permissions`);
  
  // Create Admin role with all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'Admin',
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  
  console.log(`Created Admin role with ${createdPermissions.length} permissions`);
  
  // Create default profile for admin user
  const adminProfile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {
      title: 'Mr',
      name: 'Admin',
      status: 'Active'
    },
    create: {
      title: 'Mr',
      name: 'Admin',
      status: 'Active'
    }
  });
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@faithbridge.com' },
    update: {
      password: hashedPassword,
      role: { connect: { id: adminRole.id } },
      isActive: true
    },
    create: {
      email: 'admin@faithbridge.com',
      username: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
      profileId: adminProfile.id,
      isActive: true
    }
  });
  
  console.log('Created admin user');
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });