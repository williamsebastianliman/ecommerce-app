import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SellerProfileService } from './seller-profile.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.request.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.request.dto';
import { IdDTO } from './dto/id.request.dto';

@Controller()
export class SellerProfileController {
  constructor(private readonly sellerProfileService: SellerProfileService) {}

  @MessagePattern('sellerProfile.getByUserId')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getByUserId(@Payload() data: IdDTO) {
    return this.sellerProfileService.getByUserId(data.id);
  }

  @MessagePattern('sellerProfile.getById')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getById(@Payload() data: IdDTO) {
    return this.sellerProfileService.getById(data.id);
  }

  @MessagePattern('sellerProfile.create')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Payload() dto: CreateSellerProfileDto) {
    return this.sellerProfileService.create(dto);
  }

  @MessagePattern('sellerProfile.update')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  update(@Payload() dto: UpdateSellerProfileDto) {
    return this.sellerProfileService.update(dto);
  }

  @MessagePattern('sellerProfile.removeByUserId')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  removeByUserId(@Payload() data: IdDTO) {
    return this.sellerProfileService.removeByUserId(data.id);
  }
}
