import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';
import { CartResponseDTO } from './dto/cart.response.dto';
import { CartStatsResponseDTO } from './dto/cart-stats.response.dto';

type IdParam = { userId: string };
type ProductParam = { userId: string; productId: string };

type AddItemBody = { quantity: number; productId: string };
type SetQtyBody = { quantity: number };
type IncrementBody = { delta: number };
type ReplaceItemsBody = {
  items: Array<{ productId: string; quantity: number }>;
};

@Controller('carts')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class CartController {
  constructor(
    @Inject('TRANSACTION_CLIENT') private readonly cartClient: ClientProxy,
  ) {}

  @Get(':userId')
  async get(@Param() { userId }: IdParam): Promise<CartResponseDTO> {
    try {
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.get', { userId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post(':userId/init')
  async getOrCreate(@Param() { userId }: IdParam): Promise<CartResponseDTO> {
    try {
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.getOrCreate', { userId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post(':userId/items')
  async addItem(
    @Param() { userId }: IdParam,
    @Body() body: AddItemBody,
  ): Promise<CartResponseDTO> {
    try {
      if (
        !body?.productId ||
        !Number.isInteger(body.quantity) ||
        body.quantity < 1
      ) {
        throw new BadRequestException('productId and quantity>=1 are required');
      }
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.addItem', {
            userId,
            productId: body.productId,
            quantity: body.quantity,
          })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Put(':userId/items/:productId/qty')
  async setItemQty(
    @Param() { userId, productId }: ProductParam,
    @Body() body: SetQtyBody,
  ): Promise<CartResponseDTO> {
    try {
      if (!Number.isInteger(body.quantity)) {
        throw new BadRequestException('quantity must be an integer');
      }
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.setItemQty', {
            userId,
            productId,
            quantity: body.quantity,
          })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Patch(':userId/items/:productId')
  async incrementItem(
    @Param() { userId, productId }: ProductParam,
    @Body() body: IncrementBody,
  ): Promise<CartResponseDTO> {
    try {
      if (!Number.isInteger(body.delta) || body.delta === 0) {
        throw new BadRequestException('delta must be a non-zero integer');
      }
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.incrementItem', {
            userId,
            productId,
            delta: body.delta,
          })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Delete(':userId/items/:productId')
  async removeItem(
    @Param() { userId, productId }: ProductParam,
  ): Promise<CartResponseDTO> {
    try {
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.removeItem', { userId, productId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Delete(':userId')
  async clear(@Param() { userId }: IdParam): Promise<CartResponseDTO> {
    try {
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.clear', { userId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Put(':userId/items')
  async replaceItems(
    @Param() { userId }: IdParam,
    @Body() body: ReplaceItemsBody,
  ): Promise<CartResponseDTO> {
    try {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        throw new BadRequestException('items array is required');
      }
      return await firstValueFrom(
        this.cartClient
          .send<CartResponseDTO>('cart.replaceItems', {
            userId,
            items: body.items,
          })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get(':userId/stats')
  async stats(@Param() { userId }: IdParam): Promise<CartStatsResponseDTO> {
    try {
      return await firstValueFrom(
        this.cartClient
          .send<CartStatsResponseDTO>('cart.stats', { userId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }
}
