import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransactionClientService } from './transaction-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRANSACTION_CLIENT',
        transport: Transport.TCP,
        options: {
          host: 'transaction-service',
          port: 3000,
        },
      },
    ]),
  ],
  providers: [TransactionClientService],
  exports: [TransactionClientService],
})
export class TransactionClientModule {}
