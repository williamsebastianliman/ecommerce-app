import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';

import { GetOrderDTO } from './dto/get-order.request.dto';
import { BuyerOrdersListRequestDTO } from './dto/buyer-orders-list.request.dto';
import { SellerOrdersListRequestDTO } from './dto/seller-orders-list.request.dto';
import { CreateOrderFromCartDTO } from './dto/create-order-from-cart.request.dto';
import { CreateOrderDirectDTO } from './dto/create-order-direct.request.dto';
import { OrderResponseDTO } from './dto/order.response.dto';
import { PaginatedResponse } from './dto/paginated.response.dto';
import { OrderCreatedResponseDTO } from './dto/order-created.response.dto';

@Controller('orders')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class OrderController {
  constructor(
    @Inject('TRANSACTION_CLIENT') private readonly txClient: ClientProxy,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<OrderResponseDTO> {
    try {
      return await firstValueFrom(
        this.txClient
          .send<OrderResponseDTO, GetOrderDTO>('order.getById', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('buyer/list')
  async listForBuyer(
    @Query() dto: BuyerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    try {
      return await firstValueFrom(
        this.txClient
          .send<
            PaginatedResponse<OrderResponseDTO>,
            BuyerOrdersListRequestDTO
          >('order.listForBuyer', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('seller/list')
  async listForSeller(
    @Query() dto: SellerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    try {
      return await firstValueFrom(
        this.txClient
          .send<
            PaginatedResponse<OrderResponseDTO>,
            SellerOrdersListRequestDTO
          >('order.listForSeller', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('from-cart')
  async createFromCart(
    @Body() dto: CreateOrderFromCartDTO,
  ): Promise<OrderCreatedResponseDTO> {
    try {
      return await firstValueFrom(
        this.txClient
          .send<
            OrderCreatedResponseDTO,
            CreateOrderFromCartDTO
          >('order.createFromCart', dto)
          .pipe(timeout(7000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('direct')
  async createDirect(
    @Body() dto: CreateOrderDirectDTO,
  ): Promise<OrderCreatedResponseDTO> {
    try {
      return await firstValueFrom(
        this.txClient
          .send<
            OrderCreatedResponseDTO,
            CreateOrderDirectDTO
          >('order.createDirect', dto)
          .pipe(timeout(7000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }
}
