import { PrismaClient, ROLE } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SELLER_ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_ID = '22222222-2222-4222-8222-222222222222';
const USER_ID = '33333333-3333-4333-8333-333333333333';

async function hashPw(plain: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

async function main() {
  const [sellerPassword, adminPassword, userPassword] = await Promise.all([
    hashPw('password123'),
    hashPw('password123'),
    hashPw('password123'),
  ]);

  await prisma.$transaction(async (tx) => {
    // SELLER
    const seller = await tx.user.upsert({
      where: { id: SELLER_ID },
      update: {
        email: 'seller@example.com',
        password: sellerPassword,
        name: 'Seller One',
        address: 'Jl. Mawar No. 1, Jakarta',
        role: ROLE.SELLER,
      },
      create: {
        id: SELLER_ID,
        email: 'seller@example.com',
        password: sellerPassword,
        name: 'Seller One',
        address: 'Jl. Mawar No. 1, Jakarta',
        role: ROLE.SELLER,
      },
    });

    await tx.sellerProfile.upsert({
      where: { userId: seller.id },
      update: {
        storeName: 'Demo Store',
        description: 'Official demo seller profile',
      },
      create: {
        userId: seller.id,
        storeName: 'Demo Store',
        description: 'Official demo seller profile',
      },
    });

    await tx.user.upsert({
      where: { id: ADMIN_ID },
      update: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin One',
        address: 'Jl. Melati No. 2, Jakarta',
        role: ROLE.ADMIN,
      },
      create: {
        id: ADMIN_ID,
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin One',
        address: 'Jl. Melati No. 2, Jakarta',
        role: ROLE.ADMIN,
      },
    });

    await tx.user.upsert({
      where: { id: USER_ID },
      update: {
        email: 'user@example.com',
        password: userPassword,
        name: 'User One',
        address: 'Jl. Kenanga No. 3, Jakarta',
        role: ROLE.USER,
      },
      create: {
        id: USER_ID,
        email: 'user@example.com',
        password: userPassword,
        name: 'User One',
        address: 'Jl. Kenanga No. 3, Jakarta',
        role: ROLE.USER,
      },
    });
  });

  console.log(
    'Seeded: 1 SELLER (+profile), 1 ADMIN, 1 USER with bcrypt-hashed passwords.',
  );
}

void main()
  .then(() => console.log('Seeded OK'))
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
