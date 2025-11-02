import {
  Body,
  Get,
  Inject,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
  Controller,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from './decorators/public.decorator';
import { Auth } from './decorators/auth.decorators';
import { AuthResponse, TokenResponse } from './dto/auth.response.dto';
import { MeResponse } from './dto/me.response.dto';
import type { RequestWithUser } from './types/request.types';
import type { UserWithRole } from './types/user.types';
import { firstValueFrom, timeout } from 'rxjs';
import { RegisterDTO } from './dto/register.request.dto';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';
import { LoginDTO } from './dto/login.request.dto';
import { RefreshTokenDTO } from './dto/refresh-token.request.dto';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';

@Controller()
export class AuthController {
  constructor(
    @Inject('USER_CLIENT') private readonly userClient: ClientProxy,
  ) {}

  @Public()
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

  @Public()
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
      throwRpcAsHttp(err);
    }
  }

  @Public()
  @Post('refresh')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  async refresh(@Body() dto: RefreshTokenDTO): Promise<TokenResponse> {
    try {
      return await firstValueFrom(
        this.userClient
          .send<TokenResponse, RefreshTokenDTO>('auth.refresh', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('me')
  @Auth()
  async me(@Req() req: RequestWithUser): Promise<MeResponse> {
    try {
      const user = await firstValueFrom<UserWithRole>(
        this.userClient
          .send<
            UserWithRole,
            { id: string }
          >('user.getById', { id: req.user!.sub })
          .pipe(timeout(5000)),
      );

      return new MeResponse(user.id, user.email, user.role);
    } catch (err) {
      console.log('me error: ', err);
      throwRpcAsHttp(err);
    }
  }
}
