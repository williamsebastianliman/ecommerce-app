import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';
import { CreateSellerApplicationDto } from './dto/create-seller-application.request.dto';
import { SellerApplicationDto } from './dto/seller-application.response.dto';
import { ListSellerApplicationDto } from './dto/list-seller-application.request.dto';
import { CreateSellerProfileDto } from './dto/create-seller-profile.request.dto';
import { SellerProfileDto } from './dto/seller-profile.response.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.request.dto';
import { OkDto } from './dto/ok.response.dto';

@Controller('seller')
export class SellerController {
  constructor(
    @Inject('USER_CLIENT') private readonly userClient: ClientProxy,
  ) {}

  @Post('applications')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async createApplication(
    @Body() dto: CreateSellerApplicationDto,
  ): Promise<SellerApplicationDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto,
            CreateSellerApplicationDto
          >('sellerApplication.create', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      console.log('Error: ', err);
      throwRpcAsHttp(err);
    }
  }

  @Get('applications/:id')
  async getApplicationById(
    @Param('id') id: string,
  ): Promise<SellerApplicationDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto,
            { id: string }
          >('sellerApplication.getById', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('applications/latest/:id')
  async getLatestApplicationByUser(
    @Param('id') id: string,
  ): Promise<SellerApplicationDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto,
            { id: string }
          >('sellerApplication.getLatestByUser', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      console.log(`error: ${err}`);
      throwRpcAsHttp(err);
    }
  }

  @Get('applications')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async listApplications(
    @Query() q: ListSellerApplicationDto,
  ): Promise<SellerApplicationDto[]> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto[],
            ListSellerApplicationDto
          >('sellerApplication.list', q)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('applications/:id/approve')
  async approveApplication(
    @Param('id') id: string,
  ): Promise<SellerApplicationDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto,
            { id: string }
          >('sellerApplication.approve', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('applications/:id/reject')
  async rejectApplication(
    @Param('id') id: string,
  ): Promise<SellerApplicationDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerApplicationDto,
            { id: string }
          >('sellerApplication.reject', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('profile/:id')
  async getProfileByUserId(@Param('id') id: string): Promise<SellerProfileDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerProfileDto,
            { id: string }
          >('sellerProfile.getByUserId', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('profile')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async createProfile(
    @Body() dto: CreateSellerProfileDto,
  ): Promise<SellerProfileDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerProfileDto,
            CreateSellerProfileDto
          >('sellerProfile.create', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Patch('profile')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateProfile(
    @Body() dto: UpdateSellerProfileDto,
  ): Promise<SellerProfileDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            SellerProfileDto,
            UpdateSellerProfileDto
          >('sellerProfile.update', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Delete('profile/:userId')
  async removeProfile(@Param('userId') userId: string): Promise<OkDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<
            OkDto,
            { userId: string }
          >('sellerProfile.removeByUserId', { userId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }
}
