import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SellerApplicationService } from './seller-application.service';
import { CreateSellerApplicationDto } from './dto/create-seller-application.request.dto';
import { IdDTO } from './dto/id.request.dto';
import { ListSellerApplicationDto } from './dto/list-seller-application.request.dto';

@Controller()
export class SellerApplicationController {
  constructor(private readonly service: SellerApplicationService) {}

  @MessagePattern('sellerApplication.create')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Payload() dto: CreateSellerApplicationDto) {
    return this.service.create(dto);
  }

  @MessagePattern('sellerApplication.getById')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getById(@Payload() dto: IdDTO) {
    return this.service.getById(dto);
  }

  @MessagePattern('sellerApplication.getLatestByUser')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getLatestByUser(@Payload() dto: IdDTO) {
    console.log(`dto: ${dto.id}`);
    return this.service.getLatestByUser(dto);
  }

  @MessagePattern('sellerApplication.list')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  list(@Payload() dto: ListSellerApplicationDto) {
    return this.service.list(dto);
  }

  @MessagePattern('sellerApplication.approve')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  approve(@Payload() dto: IdDTO) {
    return this.service.approve(dto);
  }

  @MessagePattern('sellerApplication.reject')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  reject(@Payload() dto: IdDTO) {
    return this.service.reject(dto);
  }
}
