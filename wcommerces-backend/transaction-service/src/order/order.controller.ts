import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { GetOrderDTO } from './dto/get-order.request.dto';
import { BuyerOrdersListRequestDTO } from './dto/buyer-orders-list.request.dto';
import { SellerOrdersListRequestDTO } from './dto/seller-orders-list.request.dto';
import { CreateOrderFromCartDTO } from './dto/create-order-from-cart.request.dto';
import { CreateOrderDirectDTO } from './dto/create-order-direct.request.dto';
import { OrderResponseDTO } from './dto/order.response.dto';
import { PaginatedResponse } from './dto/paginated.response.dto';
import { OrderCreatedResponseDTO } from './dto/order-created.response.dto';

@Controller()
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @MessagePattern('order.getById')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  getById(@Payload() dto: GetOrderDTO): Promise<OrderResponseDTO> {
    return this.orders.getById(dto);
  }

  @MessagePattern('order.listForBuyer')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  listForBuyer(
    @Payload() dto: BuyerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    return this.orders.listForBuyer(dto);
  }

  @MessagePattern('order.listForSeller')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  listForSeller(
    @Payload() dto: SellerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    return this.orders.listForSeller(dto);
  }

  @MessagePattern('order.createFromCart')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  createFromCart(
    @Payload() dto: CreateOrderFromCartDTO,
  ): Promise<OrderCreatedResponseDTO> {
    return this.orders.createFromCart(dto);
  }

  @MessagePattern('order.createDirect')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  createDirect(
    @Payload() dto: CreateOrderDirectDTO,
  ): Promise<OrderCreatedResponseDTO> {
    return this.orders.createDirect(dto);
  }
}
