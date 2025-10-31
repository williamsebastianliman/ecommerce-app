import {
  Body,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
  Controller,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthResponse } from './dto/auth.response.dto';
import { firstValueFrom, timeout } from 'rxjs';
import { RegisterDTO } from './dto/register.request.dto';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';
import { LoginDTO } from './dto/login.request.dto';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';

@Controller()
export class AuthController {
  constructor(
    @Inject('USER_CLIENT') private readonly userClient: ClientProxy,
  ) {}

  @Post('register')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  async register(@Body() dto: RegisterDTO): Promise<AuthResponse> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<AuthResponse, RegisterDTO>('auth.register', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  async login(@Body() dto: LoginDTO): Promise<AuthResponse> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<AuthResponse, LoginDTO>('auth.login', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      console.log(`test: ${err}`);
      throwRpcAsHttp(err);
    }
  }
}
