import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

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

  const imageApp = await NestFactory.create<NestExpressApplication>(AppModule);
  imageApp.useStaticAssets(join(process.cwd(), 'assets'), {
    prefix: '/assets/',
  });
  await imageApp.listen(4000);
}
bootstrap();
