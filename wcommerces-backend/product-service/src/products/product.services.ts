import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { UserClientService } from '../user-client/user-client.service';
import { TransactionClientService } from '../transaction-client/transaction-client.service';
import { Prisma, type ProductImage } from '.prisma/client';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponseDTO,
  ProductsListRequestDTO,
  ProductSellerListRequestDTO,
  ProductImageDTO,
  ImageFile,
  ImageFileResponse,
  ImageMetadata,
  PaginatedResponse,
  StockIncrementItem,
  StockIncrementResponse,
} from './dto';

@Injectable()
export class ProductService {
  private readonly ASSETS_DIR = join(process.cwd(), 'assets');

  constructor(
    private readonly prisma: PrismaService,
    private readonly userClient: UserClientService,
    private readonly transactionClient: TransactionClientService,
  ) {
    this.ensureAssetsDirectory().catch((error: Error) => {
      console.error('Failed to create assets directory:', error);
    });
  }

  private async ensureAssetsDirectory(): Promise<void> {
    try {
      await fs.access(this.ASSETS_DIR);
    } catch {
      await fs.mkdir(this.ASSETS_DIR, { recursive: true });
    }
  }

  private generateFileName(mimeType: string, originalName?: string): string {
    const ext = this.getExtensionFromMimeType(mimeType, originalName);
    return `${randomUUID()}${ext}`;
  }

  private getExtensionFromMimeType(
    mimeType: string,
    originalName?: string,
  ): string {
    if (originalName) {
      const match = originalName.match(/\.[^.]+$/);
      if (match) return match[0];
    }

    const mimeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };

    return mimeMap[mimeType] || '.bin';
  }

  private async saveImageFile(image: ImageFile): Promise<string> {
    const fileName = this.generateFileName(image.mimeType, image.originalName);
    const filePath = join(this.ASSETS_DIR, fileName);
    await fs.writeFile(filePath, image.buffer);
    return fileName;
  }

  private async deleteImageFile(fileName: string): Promise<void> {
    try {
      const filePath = join(this.ASSETS_DIR, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file ${fileName}:`, error);
    }
  }

  private async mapToProductResponse(
    product: Prisma.ProductGetPayload<{
      include: { images: true };
    }>,
  ): Promise<ProductResponseDTO> {
    const response = new ProductResponseDTO();
    response.id = product.id;
    response.sellerId = product.sellerId;
    response.name = product.name;
    response.description = product.description;
    response.stock = product.stock;
    response.price = product.price;
    response.images = product.images.map((img: ProductImage) => {
      const imageDto = new ProductImageDTO();
      imageDto.id = img.id;
      imageDto.productId = img.productId;
      imageDto.mimeType = img.mimeType;
      imageDto.createdAt = img.createdAt.toISOString();
      imageDto.dataBase64 = img.data;
      return imageDto;
    });

    try {
      response.seller = await this.userClient.getSellerById(product.sellerId);
    } catch (error) {
      console.warn(
        `Failed to fetch seller details for ID ${product.sellerId}:`,
        error,
      );
    }

    return response;
  }

  async create(
    dto: CreateProductDTO,
    images?: ImageFile[],
  ): Promise<ProductResponseDTO> {
    if (!dto.sellerId?.trim()) {
      throw new RpcException(
        new BadRequestException('sellerId is required').getResponse(),
      );
    }

    const sellerExists = await this.userClient.validateSeller(dto.sellerId);
    if (!sellerExists) {
      throw new RpcException(
        new BadRequestException('Invalid seller ID').getResponse(),
      );
    }

    if (!dto.name?.trim()) {
      throw new RpcException(
        new BadRequestException('name is required').getResponse(),
      );
    }

    if (!dto.description?.trim()) {
      throw new RpcException(
        new BadRequestException('description is required').getResponse(),
      );
    }

    if (
      dto.stock !== undefined &&
      (dto.stock < 0 || !Number.isInteger(dto.stock))
    ) {
      throw new RpcException(
        new BadRequestException(
          'stock must be a non-negative integer',
        ).getResponse(),
      );
    }

    const savedImages: Array<{ fileName: string; mimeType: string }> = [];

    if (images && images.length > 0) {
      for (const image of images) {
        if (!image.buffer || !image.mimeType) {
          throw new RpcException(
            new BadRequestException(
              'Each image must have buffer and mimeType',
            ).getResponse(),
          );
        }

        const fileName = await this.saveImageFile(image);
        savedImages.push({ fileName, mimeType: image.mimeType });
      }
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          sellerId: dto.sellerId.trim(),
          name: dto.name.trim(),
          description: dto.description.trim(),
          stock: dto.stock ?? 0,
          price: dto.price ?? 0, // if you added price to schema
          images: {
            create: savedImages.map((img) => ({
              data: img.fileName,
              mimeType: img.mimeType,
            })),
          },
        },
        include: {
          images: {
            orderBy: { createdAt: 'asc' as const },
          },
        },
      });

      return this.mapToProductResponse(product);
    } catch (error) {
      for (const img of savedImages) {
        await this.deleteImageFile(img.fileName);
      }
      throw error;
    }
  }

  async getById(id: string): Promise<ProductResponseDTO> {
    if (!id?.trim()) {
      throw new RpcException(
        new BadRequestException('id is required').getResponse(),
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    return this.mapToProductResponse(product);
  }

  async listAll(
    dto: ProductsListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const pageSize = dto.pageSize && dto.pageSize > 0 ? dto.pageSize : 10;

    const where = {} as Prisma.ProductWhereInput;

    if (dto.q?.trim()) {
      where.OR = [
        { name: { contains: dto.q.trim() } },
        { description: { contains: dto.q.trim() } },
      ];
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: await Promise.all(
        products.map((p) => this.mapToProductResponse(p)),
      ),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async listBySeller(
    dto: ProductSellerListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    if (!dto.sellerId?.trim()) {
      throw new RpcException(
        new BadRequestException('sellerId is required').getResponse(),
      );
    }

    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const pageSize = dto.pageSize && dto.pageSize > 0 ? dto.pageSize : 10;

    const where = { sellerId: dto.sellerId } as Prisma.ProductWhereInput;

    if (dto.q?.trim()) {
      where.OR = [
        { name: { contains: dto.q.trim() } },
        { description: { contains: dto.q.trim() } },
      ];
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: await Promise.all(
        products.map((p) => this.mapToProductResponse(p)),
      ),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async update(id: string, dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    if (!id?.trim()) {
      throw new RpcException(
        new BadRequestException('id is required').getResponse(),
      );
    }

    const hasUpdate =
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.stock !== undefined ||
      dto.price !== undefined;

    if (!hasUpdate) {
      throw new RpcException(
        new BadRequestException('No fields to update').getResponse(),
      );
    }

    if (
      dto.stock !== undefined &&
      (dto.stock < 0 || !Number.isInteger(dto.stock))
    ) {
      throw new RpcException(
        new BadRequestException(
          'stock must be a non-negative integer',
        ).getResponse(),
      );
    }

    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    const updateData = {} as Prisma.ProductUpdateArgs['data'];

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }

    if (dto.stock !== undefined) {
      updateData.stock = dto.stock;
    }

    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.mapToProductResponse(product);
  }

  async remove(id: string): Promise<{ ok: boolean }> {
    if (!id?.trim()) {
      throw new RpcException(
        new BadRequestException('id is required').getResponse(),
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    // First, clean up all cart entries that reference this product
    await this.transactionClient.cleanupProductFromCarts(id).catch((error) => {
      console.warn(`Failed to cleanup cart entries for product ${id}:`, error);
      // We continue with deletion even if cart cleanup fails
    });

    // Finally delete the product itself
    await this.prisma.product.delete({
      where: { id },
    });

    return { ok: true };
  }

  async listImages(productId: string): Promise<ImageMetadata[]> {
    if (!productId?.trim()) {
      throw new RpcException(
        new BadRequestException('productId is required').getResponse(),
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    const images = await this.prisma.productImage.findMany({
      where: { productId },
      select: {
        id: true,
        productId: true,
        data: true,
        mimeType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return images.map((img) => ({
      id: img.id,
      productId: img.productId,
      fileName: img.data,
      mimeType: img.mimeType,
      url: `/assets/${img.data}`,
      createdAt: img.createdAt.toISOString(),
    }));
  }

  async getImage(imageId: string): Promise<ImageFileResponse> {
    if (!imageId?.trim()) {
      throw new RpcException(
        new BadRequestException('imageId is required').getResponse(),
      );
    }

    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: {
        data: true,
        mimeType: true,
      },
    });

    if (!image) {
      throw new RpcException(
        new NotFoundException('Image not found').getResponse(),
      );
    }

    const filePath = join(this.ASSETS_DIR, image.data);

    try {
      const buffer = await fs.readFile(filePath);
      return {
        buffer,
        mimeType: image.mimeType,
        fileName: image.data,
      };
    } catch {
      throw new RpcException(
        new NotFoundException('Image file not found on disk').getResponse(),
      );
    }
  }

  async addImage(productId: string, image: ImageFile): Promise<ImageMetadata> {
    if (!productId?.trim()) {
      throw new RpcException(
        new BadRequestException('productId is required').getResponse(),
      );
    }

    if (!image?.buffer || !image?.mimeType) {
      throw new RpcException(
        new BadRequestException(
          'Image buffer and mimeType are required',
        ).getResponse(),
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    const fileName = await this.saveImageFile(image);

    try {
      const created = await this.prisma.productImage.create({
        data: {
          productId,
          data: fileName,
          mimeType: image.mimeType,
        },
      });

      return {
        id: created.id,
        productId: created.productId,
        fileName: created.data,
        mimeType: created.mimeType,
        url: `/assets/${created.data}`,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (error) {
      await this.deleteImageFile(fileName);
      throw error;
    }
  }

  async removeImage(imageId: string): Promise<{ ok: boolean }> {
    if (!imageId?.trim()) {
      throw new RpcException(
        new BadRequestException('imageId is required').getResponse(),
      );
    }

    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: { data: true },
    });

    if (!image) {
      throw new RpcException(
        new NotFoundException('Image not found').getResponse(),
      );
    }

    await this.deleteImageFile(image.data);
    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    return { ok: true };
  }

  async replaceImages(
    productId: string,
    images: ImageFile[],
  ): Promise<ProductResponseDTO> {
    if (!productId?.trim()) {
      throw new RpcException(
        new BadRequestException('productId is required').getResponse(),
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found').getResponse(),
      );
    }

    const savedImages: Array<{ fileName: string; mimeType: string }> = [];

    if (images && images.length > 0) {
      for (const image of images) {
        if (!image.buffer || !image.mimeType) {
          throw new RpcException(
            new BadRequestException(
              'Each image must have buffer and mimeType',
            ).getResponse(),
          );
        }

        const fileName = await this.saveImageFile(image);
        savedImages.push({ fileName, mimeType: image.mimeType });
      }
    }

    try {
      for (const oldImage of product.images) {
        await this.deleteImageFile(oldImage.data);
      }

      const operations: Prisma.PrismaPromise<unknown>[] = [
        this.prisma.productImage.deleteMany({
          where: { productId },
        }),
      ];

      if (savedImages.length > 0) {
        operations.push(
          this.prisma.productImage.createMany({
            data: savedImages.map((img) => ({
              productId,
              data: img.fileName,
              mimeType: img.mimeType,
            })),
          }),
        );
      }

      await this.prisma.$transaction(operations);

      const updated = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          images: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!updated) {
        throw new RpcException(
          new NotFoundException('Product not found after update').getResponse(),
        );
      }

      return this.mapToProductResponse(product);
    } catch (error) {
      for (const img of savedImages) {
        await this.deleteImageFile(img.fileName);
      }
      throw error;
    }
  }

  async incrementStocks(
    items: StockIncrementItem[],
  ): Promise<StockIncrementResponse> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new RpcException(
        new BadRequestException('items array is required').getResponse(),
      );
    }

    for (const item of items) {
      if (!item?.productId?.trim()) {
        throw new RpcException(
          new BadRequestException(
            'Each item must have productId',
          ).getResponse(),
        );
      }

      if (
        typeof item.delta !== 'number' ||
        !Number.isInteger(item.delta) ||
        item.delta <= 0
      ) {
        throw new RpcException(
          new BadRequestException(
            'Each item.delta must be a positive integer',
          ).getResponse(),
        );
      }
    }

    const merged = new Map<string, number>();
    for (const { productId, delta } of items) {
      merged.set(productId, (merged.get(productId) ?? 0) + delta);
    }

    const productIds = Array.from(merged.keys());

    const existing = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });

    const existingSet = new Set(existing.map((p) => p.id));
    const missing = productIds.filter((id) => !existingSet.has(id));

    if (missing.length > 0) {
      throw new RpcException(
        new NotFoundException(
          `Products not found: ${missing.join(', ')}`,
        ).getResponse(),
      );
    }

    const updates = await this.prisma.$transaction(
      productIds.map((id) =>
        this.prisma.product.update({
          where: { id },
          data: { stock: { increment: merged.get(id) ?? 0 } },
          select: { id: true, stock: true },
        }),
      ),
    );

    return {
      updated: updates,
      count: updates.length,
    };
  }
}
