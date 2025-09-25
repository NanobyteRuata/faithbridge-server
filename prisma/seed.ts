import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient()

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL
  const phone = process.env.SUPER_ADMIN_PHONE
  const username = process.env.SUPER_ADMIN_USERNAME
  const password = process.env.SUPER_ADMIN_PASSWORD

  if (!email || !phone || !username || !password) {
    throw new Error('❌ Some required ENVs not found');
  }

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { email, isSuperAdmin: true },
  })

  if (existing) {
    console.log('✅ Super admin already exists.')
    return
  }

  const superAdminProfile = await prisma.profile.create({
    data: {
      title: 'Mr.',
      name: process.env.SUPER_ADMIN_NAME ?? 'Admin'
    }
  });

  const hashedPassword = await bcrypt.hash(password, 10)

  const superAdmin = await prisma.user.create({
    data: {
      email,
      phone,
      username,
      password: hashedPassword,
      isSuperAdmin: true,
      isActive: true,
      profileId: superAdminProfile.id
    },
  })

  console.log('✅ Super admin created:', superAdmin)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
  })