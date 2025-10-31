import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDTO } from './dto/register.request.dto';
import { LoginDTO } from './dto/login.request.dto';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @MessagePattern('auth.register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  register(@Payload() dto: RegisterDTO) {
    return this.auth.register(dto);
  }

  @MessagePattern('auth.login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  login(@Payload() dto: LoginDTO) {
    return this.auth.login(dto);
  }
}
