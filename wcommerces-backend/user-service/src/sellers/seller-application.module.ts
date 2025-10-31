import { Module } from '@nestjs/common';
import { SellerApplicationController } from './seller-application.controller';
import { SellerApplicationService } from './seller-application.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SellerApplicationController],
  providers: [SellerApplicationService, PrismaService],
  exports: [SellerApplicationService],
})
export class SellerApplicationModule {}
