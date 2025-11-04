import { PrismaClient } from '@prisma/client';
import { v5 as uuidv5 } from 'uuid';

const prisma = new PrismaClient();
const NS = '3b241101-e2bb-4255-8caf-4136c566a962';
const SELLER_ID = '11111111-1111-4111-8111-111111111111';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  await prisma.$transaction(async (tx) => {
    for (let i = 1; i <= 30; i++) {
      const id = uuidv5(String(i), NS);

      await tx.product.upsert({
        where: { id },
        update: {
          name: `Product ${i}`,
          description: `Description for product ${i}`,
          stock: randInt(5, 50),
          price: randInt(20000, 200000),
        },
        create: {
          id,
          sellerId: SELLER_ID,
          name: `Product ${i}`,
          description: `Description for product ${i}`,
          stock: randInt(5, 50),
          price: randInt(20000, 200000),
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });

      const img1Id = uuidv5(`${id}-img1`, NS);
      const img2Id = uuidv5(`${id}-img2`, NS);

      await tx.productImage.createMany({
        data: [
          {
            id: img1Id,
            productId: id,
            data: 'img1.jpg',
            mimeType: 'image/jpeg',
          },
          {
            id: img2Id,
            productId: id,
            data: 'img2.jpg',
            mimeType: 'image/jpeg',
          },
        ],
        skipDuplicates: true,
      });
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed: 30 products, 60 images (deterministic IDs).');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
