import { Module } from '@nestjs/common';

import { Transport, ClientsModule } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { UserController } from './users/user.controller';
import { SellerController } from './sellers/seller.controller';
import { ProductController } from './product/product.controller';
import { MediaController } from './media/media.controller';
import { HttpModule } from '@nestjs/axios';
import { CartController } from './cart/cart.controller';
import { OrderController } from './order/order.controller';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'USER_CLIENT',
        transport: Transport.TCP,
        options: { host: 'user-service', port: 3000 },
      },
      {
        name: 'PRODUCT_CLIENT',
        transport: Transport.TCP,
        options: { host: 'product-service', port: 3000 },
      },
      {
        name: 'TRANSACTION_CLIENT',
        transport: Transport.TCP,
        options: { host: 'transaction-service', port: 3000 },
      },
    ]),
  ],
  controllers: [
    AuthController,
    UserController,
    SellerController,
    ProductController,
    MediaController,
    CartController,
    OrderController,
  ],
})
export class AppModule {}
