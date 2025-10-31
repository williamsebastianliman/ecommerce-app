import {
  BadRequestException,
  Controller,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.services';

import { CreateProductDTO } from './dto/create-product.request.dto';
import { ProductsListRequestDTO } from './dto/products-list.request.dto';
import { ProductSellerListRequestDTO } from './dto/product-seller-list.request.dto';

import {
  ImageFile,
  ImageFileResponse,
  ImageMetadata,
  PaginatedResponse,
  StockIncrementItem,
  StockIncrementResponse,
  UpdateProductDTO,
} from './dto/product-io.dto';
import { ProductResponseDTO } from './dto/product.response.dto';

type UpdateProductPayload = { id: string; dto: UpdateProductDTO };
type IdPayload = { id: string };
type GetImagePayload = { imageId: string };
type ReplaceImagesPayload = { productId: string; images: ImageFile[] };
type ListImagesPayload = { productId: string };
type IncrementStocksPayload = { items: StockIncrementItem[] };
type IncomingImage = {
  dataBase64: string;
  mimeType: string;
  originalName?: string;
};

type AddImageCreateStylePayload = {
  productId: string;
  image: IncomingImage;
};

function isIncomingImage(x: unknown): x is IncomingImage {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as IncomingImage).dataBase64 === 'string' &&
    typeof (x as IncomingImage).mimeType === 'string'
  );
}
@Controller()
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @MessagePattern('product.create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(
    @Payload()
    payload: {
      dto: CreateProductDTO;
      images?: {
        dataBase64: string;
        mimeType: string;
        originalName?: string;
      }[];
    },
  ): Promise<ProductResponseDTO> {
    const decoded =
      payload.images?.map((img) => ({
        buffer: Buffer.from(img.dataBase64, 'base64'),
        mimeType: img.mimeType,
        originalName: img.originalName,
      })) ?? [];
    console.log('decoded: ', decoded);
    return this.products.create(payload.dto, decoded);
  }

  @MessagePattern('product.getById')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  getById(@Payload() { id }: IdPayload): Promise<ProductResponseDTO> {
    return this.products.getById(id);
  }

  @MessagePattern('product.listAll')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  listAll(
    @Payload() dto: ProductsListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    return this.products.listAll(dto);
  }

  @MessagePattern('product.listBySeller')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  listBySeller(
    @Payload() dto: ProductSellerListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    return this.products.listBySeller(dto);
  }

  @MessagePattern('product.update')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Payload() payload: UpdateProductPayload,
  ): Promise<ProductResponseDTO> {
    return this.products.update(payload.id, payload.dto);
  }

  @MessagePattern('product.remove')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  remove(@Payload() { id }: IdPayload): Promise<{ ok: boolean }> {
    return this.products.remove(id);
  }

  @MessagePattern('product.listImages')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  listImages(
    @Payload() { productId }: ListImagesPayload,
  ): Promise<ImageMetadata[]> {
    return this.products.listImages(productId);
  }

  @MessagePattern('product.getImage')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  getImage(
    @Payload() { imageId }: GetImagePayload,
  ): Promise<ImageFileResponse> {
    return this.products.getImage(imageId);
  }

  @MessagePattern('product.addImage')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addImage(
    @Payload() payload: AddImageCreateStylePayload,
  ): Promise<ImageMetadata> {
    if (!payload?.productId?.trim()) {
      throw new BadRequestException('productId is required');
    }
    if (!isIncomingImage(payload?.image)) {
      throw new BadRequestException(
        'image must include dataBase64 (string) and mimeType (string)',
      );
    }

    const decoded: ImageFile = {
      buffer: Buffer.from(payload.image.dataBase64, 'base64'),
      mimeType: payload.image.mimeType,
      originalName: payload.image.originalName,
    };
    console.log('decoded: ', decoded);

    return this.products.addImage(payload.productId, decoded);
  }

  @MessagePattern('product.removeImage')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  removeImage(@Payload() { id }: IdPayload): Promise<{ ok: boolean }> {
    return this.products.removeImage(id);
  }

  @MessagePattern('product.replaceImages')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  replaceImages(
    @Payload() payload: ReplaceImagesPayload,
  ): Promise<ProductResponseDTO> {
    return this.products.replaceImages(payload.productId, payload.images);
  }

  @MessagePattern('product.incrementStocks')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  incrementStocks(
    @Payload() payload: IncrementStocksPayload,
  ): Promise<StockIncrementResponse> {
    return this.products.incrementStocks(payload.items);
  }
}
