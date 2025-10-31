import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { SellerProfileModule } from './sellers/seller-profile.module';
import { SellerApplicationModule } from './sellers/seller-application.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    SellerProfileModule,
    SellerApplicationModule,
  ],
})
export class AppModule {}
