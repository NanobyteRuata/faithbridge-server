import { Permission, PrismaClient } from '@prisma/client';
import { RESOURCE_ACTIONS } from '../src/shared/constants/actions.constant';
import { RESOURCES } from '../src/shared/constants/resources.constant';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

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
  const adminRoleName = process.env.ADMIN_ROLE_NAME || 'Admin';
  const adminRole = await prisma.role.upsert({
    where: { name: adminRoleName },
    update: {
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: adminRoleName,
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  
  console.log(`Created Admin role with ${createdPermissions.length} permissions`);
  
  // Create default profile and admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE || '+1123123123';
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail, phone: adminPhone } });
  if (!adminUser) {
    const adminProfileData = {
      title: 'Mr',
      name: process.env.ADMIN_NAME || 'Admin',
      status: 'Active'
    }

    const adminProfile = await prisma.profile.create({
      data: adminProfileData
    });
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    await prisma.user.create({
      data: {
        email: adminEmail,
        phone: adminPhone,
        username: adminUsername,
        password: hashedPassword,
        roleId: adminRole.id,
        profileId: adminProfile.id,
        isActive: true
      }
    });
    
    console.log('Created admin user');
  }

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