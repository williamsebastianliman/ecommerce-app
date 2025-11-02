import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductClientService } from '../product-client/product-client.service';
import { UserClientService } from '../user-client/user-client.service';
import { GetOrderDTO } from './dto/get-order.request.dto';
import { BuyerOrdersListRequestDTO } from './dto/buyer-orders-list.request.dto';
import { SellerOrdersListRequestDTO } from './dto/seller-orders-list.request.dto';
import { CreateOrderFromCartDTO } from './dto/create-order-from-cart.request.dto';
import { CreateOrderDirectDTO } from './dto/create-order-direct.request.dto';
import { OrderResponseDTO } from './dto/order.response.dto';
import { OrderDetailResponseDTO } from './dto/order-detail.response.dto';
import { PaginatedResponse } from './dto/paginated.response.dto';
import { ProductInOrderResponseDTO } from './dto/product-in-order.response.dto';
import { OrderCreatedResponseDTO } from './dto/order-created.response.dto';
import { ProductResponseDTO } from '../product-client/dto/product.response.dto';

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { orderDetails: true };
}>;
type StockDeltaItem = { productId: string; delta: number };
type IncrementStocksPayload = { items: StockDeltaItem[] };
type IncrementStocksFn = (payload: IncrementStocksPayload) => Promise<unknown>;
type ProductWithOptionalPrice = { price?: number | null };

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductClientService,
    private readonly users: UserClientService,
  ) {}

  async getById(dto: GetOrderDTO): Promise<OrderResponseDTO> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.id },
      include: { orderDetails: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.toOrderResponse(order);
  }

  async listForBuyer(
    dto: BuyerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    await this.users.getById(dto.userId);
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const pageSize = dto.pageSize && dto.pageSize > 0 ? dto.pageSize : 10;
    const baseWhere = { userId: dto.userId };
    const total = await this.prisma.order.count({ where: baseWhere });
    const rows = await this.prisma.order.findMany({
      where: baseWhere,
      include: { orderDetails: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let filtered = rows;
    if (dto.sellerNameContains && dto.sellerNameContains.trim() !== '') {
      const sellerIds = Array.from(
        new Set(rows.flatMap((o) => o.orderDetails.map((d) => d.sellerId))),
      );
      const sellerMap = await this.batchUserNamesByIds(sellerIds);
      const needle = dto.sellerNameContains.toLowerCase();
      filtered = rows.filter((o) =>
        o.orderDetails.some((d) =>
          (sellerMap.get(d.sellerId) || '').toLowerCase().includes(needle),
        ),
      );
    }

    const data = filtered.map((o) => this.toOrderResponse(o));
    filtered.map((o) => {
      const a = this.toOrderResponse(o);
      console.log('per data: ', a.orderDetails);
    });
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async listForSeller(
    dto: SellerOrdersListRequestDTO,
  ): Promise<PaginatedResponse<OrderResponseDTO>> {
    await this.users.getById(dto.sellerId);
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const pageSize = dto.pageSize && dto.pageSize > 0 ? dto.pageSize : 10;

    const orderIdsRows = await this.prisma.orderDetail.findMany({
      where: { sellerId: dto.sellerId },
      select: { orderId: true },
    });
    const uniqueOrderIds = Array.from(
      new Set(orderIdsRows.map((r) => r.orderId)),
    );
    if (uniqueOrderIds.length === 0) {
      return { data: [], meta: { total: 0, page, pageSize, totalPages: 1 } };
    }

    const total = await this.prisma.order.count({
      where: { id: { in: uniqueOrderIds } },
    });
    const rows = await this.prisma.order.findMany({
      where: { id: { in: uniqueOrderIds } },
      include: { orderDetails: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let filtered = rows;
    if (dto.buyerNameContains && dto.buyerNameContains.trim() !== '') {
      const buyerIds = Array.from(new Set(rows.map((o) => o.userId)));
      const buyerMap = await this.batchUserNamesByIds(buyerIds);
      const needle = dto.buyerNameContains.toLowerCase();
      filtered = rows.filter((o) =>
        (buyerMap.get(o.userId) || '').toLowerCase().includes(needle),
      );
    }

    const data = filtered.map((o) => this.toOrderResponse(o));
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async createFromCart(
    dto: CreateOrderFromCartDTO,
  ): Promise<OrderCreatedResponseDTO> {
    await this.users.getById(dto.userId);
    const cart = await this.prisma.cart.findFirst({
      where: { userId: dto.userId },
      include: { items: true },
    });
    if (!cart || cart.items.length === 0)
      throw new BadRequestException('Cart is empty');

    const items = cart.items.map((i) => ({
      productId: i.productId.trim(),
      qty: i.quantity,
    }));

    const prods: ProductResponseDTO[] = await Promise.all(
      items.map((i) => this.products.getById(i.productId)),
    );
    const sellerIds = Array.from(new Set(prods.map((p) => p.sellerId)));
    await Promise.all(sellerIds.map((sid) => this.users.getById(sid)));

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({ data: { userId: dto.userId } });
      const detailsData = items.map((i, idx) => {
        const prod = prods[idx];
        const priceSnapshot = this.extractPrice(prod);
        const imageId = prod.images?.[0]?.dataBase64 ?? '';
        return {
          orderId: created.id,
          productId: i.productId,
          productName: prod.name,
          productDescription: prod.description,
          productImage: imageId,
          sellerId: prod.sellerId,
          qty: i.qty,
          priceSnapshot,
        };
      });
      await tx.orderDetail.createMany({ data: detailsData });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    await this.tryAdjustStocks(
      items.map((i) => ({ productId: i.productId, delta: -i.qty })),
    );
    return { id: order.id, userId: order.userId, createdAt: order.createdAt };
  }

  async createDirect(
    dto: CreateOrderDirectDTO,
  ): Promise<OrderCreatedResponseDTO> {
    await this.users.getById(dto.userId);
    if (!dto.items || dto.items.length === 0)
      throw new BadRequestException('items is required');
    const normalized = dto.items.map((i) => ({
      productId: i.productId.trim(),
      qty: i.qty,
    }));

    const prods: ProductResponseDTO[] = await Promise.all(
      normalized.map((i) => this.products.getById(i.productId)),
    );
    const sellerIds = Array.from(new Set(prods.map((p) => p.sellerId)));
    await Promise.all(sellerIds.map((sid) => this.users.getById(sid)));

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({ data: { userId: dto.userId } });
      const detailsData = normalized.map((i, idx) => {
        const prod = prods[idx];
        const priceSnapshot = this.extractPrice(prod);
        const imageId = prod.images?.[0]?.id ?? '';
        return {
          orderId: created.id,
          productId: i.productId,
          productName: prod.name,
          productDescription: prod.description,
          productImage: imageId,
          sellerId: prod.sellerId,
          qty: i.qty,
          priceSnapshot,
        };
      });
      await tx.orderDetail.createMany({ data: detailsData });
      return created;
    });

    await this.tryAdjustStocks(
      normalized.map((i) => ({ productId: i.productId, delta: -i.qty })),
    );
    return { id: order.id, userId: order.userId, createdAt: order.createdAt };
  }

  private toOrderResponse(order: OrderWithDetails): OrderResponseDTO {
    type DetailRow = OrderWithDetails['orderDetails'][number];

    const detailsSorted: DetailRow[] = [...order.orderDetails].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const enriched: OrderDetailResponseDTO[] = detailsSorted.map(
      (d: DetailRow): OrderDetailResponseDTO => {
        const product: ProductInOrderResponseDTO = {
          id: String(d.productId),
          name: String(d.productName),
          description: String(d.productDescription),
          image: d.productImage ? String(d.productImage) : undefined,
        };
        console.log('product: ', product);

        return {
          id: String(d.id),
          orderId: String(d.orderId),
          productId: String(d.productId),
          sellerId: String(d.sellerId),
          qty: Number(d.qty),
          priceSnapshot: Number(d.priceSnapshot),
          createdAt: d.createdAt,
          product,
        };
      },
    );

    return {
      id: String(order.id),
      userId: String(order.userId),
      createdAt: order.createdAt,
      orderDetails: enriched,
    };
  }

  private async batchUserNamesByIds(
    ids: string[],
  ): Promise<Map<string, string>> {
    const unique = Array.from(new Set(ids));
    type Pair = readonly [string, string];
    const pairs = await Promise.all<Pair>(
      unique.map(async (id) => {
        try {
          const u = await this.users.getById(id);
          const name = (u.name ?? u.email ?? '').trim();
          return [id, name] as const;
        } catch {
          return [id, ''] as const;
        }
      }),
    );
    return new Map<string, string>(pairs);
  }

  private extractPrice(prod: ProductWithOptionalPrice): number {
    const n = prod?.price;
    return typeof n === 'number' && Number.isFinite(n)
      ? Math.max(0, Math.floor(n))
      : 0;
  }

  private async tryAdjustStocks(items: StockDeltaItem[]): Promise<void> {
    if (!this.hasIncrementStocks(this.products)) return;
    await this.products.incrementStocks({ items });
  }

  private hasIncrementStocks(
    svc: unknown,
  ): svc is { incrementStocks: IncrementStocksFn } {
    return (
      !!svc &&
      typeof (svc as { incrementStocks?: unknown }).incrementStocks ===
        'function'
    );
  }
}
