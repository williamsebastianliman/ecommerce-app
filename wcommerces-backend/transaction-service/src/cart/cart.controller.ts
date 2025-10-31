import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { GetCartDTO } from './dto/get-cart.request.dto';
import { CreateCartDTO } from './dto/create-cart.request.dto';
import { AddItemDTO } from './dto/add-item.request.dto';
import { SetItemQtyDTO } from './dto/set-item-qty.request.dto';
import { IncrementItemDTO } from './dto/increment-item.request.dto';
import { RemoveItemDTO } from './dto/remove-item.request.dto';
import { ClearCartDTO } from './dto/clear-cart.request.dto';
import { ReplaceItemsDTO } from './dto/replace-items.request.dto';
import { CartResponseDTO } from './dto/cart.response.dto';
import { CartStatsResponseDTO } from './dto/cart-stats.response.dto';

@Controller()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class CartController {
  constructor(private readonly service: CartService) {}

  @MessagePattern('cart.get')
  get(@Payload() dto: GetCartDTO): Promise<CartResponseDTO> {
    return this.service.getCart(dto);
  }

  @MessagePattern('cart.getOrCreate')
  getOrCreate(@Payload() dto: CreateCartDTO): Promise<CartResponseDTO> {
    return this.service.getOrCreateCart(dto);
  }

  @MessagePattern('cart.addItem')
  addItem(@Payload() dto: AddItemDTO): Promise<CartResponseDTO> {
    return this.service.addItem(dto);
  }

  @MessagePattern('cart.setItemQty')
  setItemQty(@Payload() dto: SetItemQtyDTO): Promise<CartResponseDTO> {
    return this.service.setItemQty(dto);
  }

  @MessagePattern('cart.incrementItem')
  incrementItem(@Payload() dto: IncrementItemDTO): Promise<CartResponseDTO> {
    return this.service.incrementItem(dto);
  }

  @MessagePattern('cart.removeItem')
  removeItem(@Payload() dto: RemoveItemDTO): Promise<CartResponseDTO> {
    return this.service.removeItem(dto);
  }

  @MessagePattern('cart.clear')
  clear(@Payload() dto: ClearCartDTO): Promise<CartResponseDTO> {
    return this.service.clearCart(dto);
  }

  @MessagePattern('cart.replaceItems')
  replaceItems(@Payload() dto: ReplaceItemsDTO): Promise<CartResponseDTO> {
    return this.service.replaceItems(dto);
  }

  @MessagePattern('cart.stats')
  stats(@Payload() dto: GetCartDTO): Promise<CartStatsResponseDTO> {
    return this.service.stats(dto);
  }
}
