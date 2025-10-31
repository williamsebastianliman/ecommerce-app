import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';
import { UserResponseDto } from './dto/user.response.dto';
import { UpdateUserDTO } from './dto/update-user.request.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_CLIENT') private readonly userClient: ClientProxy,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<UserResponseDto>('user.getById', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Patch()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async update(@Body() dto: UpdateUserDTO): Promise<UserResponseDto> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<UserResponseDto, UpdateUserDTO>('user.update', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }
}
