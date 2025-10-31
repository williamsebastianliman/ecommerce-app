import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductClientModule } from '../product-client/product-client.module';
import { UserClientModule } from '../user-client/user-client.module';

@Module({
  imports: [PrismaModule, ProductClientModule, UserClientModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
