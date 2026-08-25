import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { ROLE_NAMES } from '../types/roles';
import { getOrCreateRole } from '../utils/roles';

async function main() {
  for (const name of ROLE_NAMES) {
    await getOrCreateRole(name);
  }

  const email = 'admin@school.com';
  const password = 'password';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const adminRole = await getOrCreateRole('ADMIN');
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin account created: ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
