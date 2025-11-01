import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserClientService } from './user-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_CLIENT',
        transport: Transport.TCP,
        options: {
          host: 'user-service',
          port: 3000,
        },
      },
    ]),
  ],
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}
