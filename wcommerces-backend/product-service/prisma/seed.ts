import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({});
    await tx.product.deleteMany({});

    for (let i = 1; i <= 30; i++) {
      const product = await tx.product.create({
        data: {
          sellerId: `11111111-1111-4111-8111-111111111111`,
          name: `Product ${i}`,
          description: `Description for product ${i}`,
          stock: randInt(5, 50),
          price: randInt(20000, 200000),
        },
      });

      await tx.productImage.createMany({
        data: [
          { productId: product.id, data: 'img1.jpg', mimeType: 'image/jpeg' },
          { productId: product.id, data: 'img2.jpg', mimeType: 'image/jpeg' },
        ],
      });
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed: 30 products, 60 images.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
