import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductClientService } from '../product-client/product-client.service';
import { CartResponseDTO } from './dto/cart.response.dto';
import { GetCartDTO } from './dto/get-cart.request.dto';
import { CreateCartDTO } from './dto/create-cart.request.dto';
import { AddItemDTO } from './dto/add-item.request.dto';
import { SetItemQtyDTO } from './dto/set-item-qty.request.dto';
import { IncrementItemDTO } from './dto/increment-item.request.dto';
import { RemoveItemDTO } from './dto/remove-item.request.dto';
import { ClearCartDTO } from './dto/clear-cart.request.dto';
import { ReplaceItemsDTO } from './dto/replace-items.request.dto';
import { CartStatsResponseDTO } from './dto/cart-stats.response.dto';
import { ProductInCartResponseDTO } from './dto/product-in-cart.response.dto';

type CartWithItems = Prisma.CartGetPayload<{ include: { items: true } }>;
type CartItemEntity = CartWithItems['items'][number];

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductClientService,
  ) {}

  async getCart(dto: GetCartDTO): Promise<CartResponseDTO> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId: dto.userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return await this.toCartResponse(cart);
  }

  async getOrCreateCart(dto: CreateCartDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    return await this.toCartResponse(cart);
  }

  async addItem(dto: AddItemDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    const productId = dto.productId.trim();
    await this.ensureProductExists(productId);
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: dto.quantity },
      });
    }
    return await this.getCart({ userId: dto.userId });
  }

  async setItemQty(dto: SetItemQtyDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    const productId = dto.productId.trim();
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (!item) {
      if (dto.quantity === 0) return await this.getCart({ userId: dto.userId });
      await this.ensureProductExists(productId);
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: dto.quantity },
      });
    } else {
      if (dto.quantity <= 0) {
        await this.prisma.cartItem.delete({ where: { id: item.id } });
      } else {
        await this.prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity: dto.quantity },
        });
      }
    }
    return await this.getCart({ userId: dto.userId });
  }

  async incrementItem(dto: IncrementItemDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    const productId = dto.productId.trim();
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (!item) {
      if (dto.delta <= 0) return await this.getCart({ userId: dto.userId });
      await this.ensureProductExists(productId);
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: dto.delta },
      });
    } else {
      const next = item.quantity + dto.delta;
      if (next <= 0) {
        await this.prisma.cartItem.delete({ where: { id: item.id } });
      } else {
        await this.prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity: next },
        });
      }
    }
    return await this.getCart({ userId: dto.userId });
  }

  async removeItem(dto: RemoveItemDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    const productId = dto.productId.trim();
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });
    if (item) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    }
    return await this.getCart({ userId: dto.userId });
  }

  async clearCart(dto: ClearCartDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return await this.getCart({ userId: dto.userId });
  }

  async replaceItems(dto: ReplaceItemsDTO): Promise<CartResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    if (!dto.items || dto.items.length === 0)
      throw new BadRequestException('items is required');
    const normalized = dto.items.map((i) => ({
      productId: i.productId.trim(),
      quantity: i.quantity,
    }));
    const uniqueIds = Array.from(new Set(normalized.map((i) => i.productId)));
    await Promise.all(uniqueIds.map((id) => this.ensureProductExists(id)));
    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      this.prisma.cartItem.createMany({
        data: normalized.map((i) => ({
          cartId: cart.id,
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    ]);
    return await this.getCart({ userId: dto.userId });
  }

  async stats(dto: GetCartDTO): Promise<CartStatsResponseDTO> {
    const cart = await this.ensureCart(dto.userId);
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });
    const count = items.length;
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    return { count, totalQty };
  }

  private async ensureCart(userId: string): Promise<CartWithItems> {
    const existing = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (existing) return existing;
    const created = await this.prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
    return created;
  }

  private async toCartResponse(cart: CartWithItems): Promise<CartResponseDTO> {
    const itemsSorted = [...cart.items].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const hydrated = await Promise.all(
      itemsSorted.map(async (i: CartItemEntity) => {
        const product = await this.loadProductSummary(i.productId);
        return {
          id: i.id,
          productId: i.productId,
          quantity: i.quantity,
          createdAt: i.createdAt,
          product,
        };
      }),
    );
    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: hydrated,
    };
  }

  private async loadProductSummary(
    productId: string,
  ): Promise<ProductInCartResponseDTO> {
    const id = productId.trim();
    const prod = await this.products.getById(id);
    const imgs = await this.products.listImages(id);
    const first = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : undefined;
    return {
      id: prod.id,
      name: prod.name,
      description: prod.description,
      image: first ? { id: first.id, mimeType: first.mimeType } : undefined,
    };
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const id = productId.trim();
    await this.products.getById(id);
  }
}
