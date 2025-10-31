import { Module } from '@nestjs/common';
import { SellerProfileController } from './seller-profile.controller';
import { SellerProfileService } from './seller-profile.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SellerProfileController],
  providers: [SellerProfileService, PrismaService],
  exports: [SellerProfileService],
})
export class SellerProfileModule {}
