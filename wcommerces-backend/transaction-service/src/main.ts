import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TcpOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const tcpOptions: TcpOptions = {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3000 },
  };
  const app = await NestFactory.createMicroservice<TcpOptions>(
    AppModule,
    tcpOptions,
  );
  await app.listen();
}

bootstrap();
