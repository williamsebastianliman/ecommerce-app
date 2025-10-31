import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { GetUserDTO } from './dto/get-user.request.dto';
import { UpdateUserDTO } from './dto/update-user.request.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.getById')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getById(@Payload() data: GetUserDTO) {
    console.log(`data: ${data.id}`);
    return this.userService.getById(data.id);
  }

  @MessagePattern('user.update')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async update(@Payload() data: UpdateUserDTO) {
    return this.userService.update(data.id, {
      name: data.name ?? '',
      address: data.address ?? '',
    });
  }
}
