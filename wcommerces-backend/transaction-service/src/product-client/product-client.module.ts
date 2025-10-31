import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductClientService } from './product-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_CLIENT',
        transport: Transport.TCP,
        options: {
          host: 'product-service',
          port: 3000,
        },
      },
    ]),
  ],
  providers: [ProductClientService],
  exports: [ProductClientService],
})
export class ProductClientModule {}
