import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserClientModule } from '../user-client/user-client.module';
import { TransactionClientModule } from '../transaction-client/transaction-client.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.services';

@Module({
  imports: [PrismaModule, UserClientModule, TransactionClientModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
