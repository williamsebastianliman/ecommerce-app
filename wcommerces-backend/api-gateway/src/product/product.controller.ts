import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom, timeout } from 'rxjs';
import { throwRpcAsHttp } from '../utils/rpc-to-http.util';

import { CreateProductDTO } from './dto/create-product.request.dto';
import { ProductsListRequestDTO } from './dto/products-list.request.dto';
import { ProductSellerListRequestDTO } from './dto/product-seller-list.request.dto';
import { ProductResponseDTO } from './dto/product.response.dto';
import {
  ImageFile,
  ImageFileResponse,
  ImageMetadata,
  PaginatedResponse,
  StockIncrementItem,
  StockIncrementResponse,
} from './dto/product-io.dto';
import 'multer';
import { UpdateProductDTO } from './dto/update-product.request.dto';

type UpdatePayload = { id: string; dto: UpdateProductDTO };
type IdPayload = { id: string };
type GetImagePayload = { imageId: string };
type AddImagePayload = {
  productId: string;
  image: { dataBase64: string; mimeType: string; originalName?: string };
};
type ListImagesPayload = { productId: string };
type IncrementStocksPayload = { items: StockIncrementItem[] };
type UploadedFileLike = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};
@Controller('products')
export class ProductController {
  constructor(
    @Inject('PRODUCT_CLIENT') private readonly productClient: ClientProxy,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProductResponseDTO> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<ProductResponseDTO>('product.getById', { id } as IdPayload)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async listAll(
    @Query() dto: ProductsListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<
            PaginatedResponse<ProductResponseDTO>,
            ProductsListRequestDTO
          >('product.listAll', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('seller/list')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async listBySeller(
    @Query() dto: ProductSellerListRequestDTO,
  ): Promise<PaginatedResponse<ProductResponseDTO>> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<
            PaginatedResponse<ProductResponseDTO>,
            ProductSellerListRequestDTO
          >('product.listBySeller', dto)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async create(
    @Body() dto: CreateProductDTO,
    @UploadedFiles() files?: UploadedFileLike[],
  ): Promise<ProductResponseDTO> {
    const images =
      files?.map((f) => ({
        dataBase64: f.buffer.toString('base64'),
        mimeType: f.mimetype,
        originalName: f.originalname,
      })) ?? [];

    try {
      console.log('test123');
      return await firstValueFrom(
        this.productClient
          .send<
            ProductResponseDTO,
            {
              dto: CreateProductDTO;
              images: {
                dataBase64: string;
                mimeType: string;
                originalName?: string;
              }[];
            }
          >('product.create', { dto, images })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      console.log('error: ', err);
      throwRpcAsHttp(err);
    }
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDTO,
  ): Promise<ProductResponseDTO> {
    try {
      if (!dto || Object.keys(dto).length === 0) {
        throw new BadRequestException('No fields to update');
      }

      return await firstValueFrom(
        this.productClient
          .send<
            ProductResponseDTO,
            UpdatePayload
          >('product.update', { id, dto })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ ok: boolean }> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<{ ok: boolean }, IdPayload>('product.remove', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get(':id/images')
  async listImages(@Param('id') productId: string): Promise<ImageMetadata[]> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<
            ImageMetadata[],
            ListImagesPayload
          >('product.listImages', { productId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Get('images/:imageId')
  async getImage(
    @Param('imageId') imageId: string,
  ): Promise<ImageFileResponse> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<
            ImageFileResponse,
            GetImagePayload
          >('product.getImage', { imageId })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 20))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async addImage(
    @Param('id') productId: string,
    @UploadedFiles() files?: UploadedFileLike[],
  ): Promise<ImageMetadata[]> {
    const images =
      files?.map((f) => ({
        dataBase64: f.buffer.toString('base64'),
        mimeType: f.mimetype,
        originalName: f.originalname,
      })) ?? [];

    if (images.length === 0) {
      throw new BadRequestException(
        "Provide files via multipart field 'images'",
      );
    }

    try {
      const tasks = images.map((img) =>
        firstValueFrom(
          this.productClient
            .send<ImageMetadata, AddImagePayload>('product.addImage', {
              productId,
              image: {
                dataBase64: img.dataBase64,
                mimeType: img.mimeType,
                originalName: img.originalName,
              },
            })
            .pipe(timeout(5000)),
        ),
      );
      return await Promise.all(tasks);
    } catch (err) {
      console.log('error1: ', err);
      throwRpcAsHttp(err);
    }
  }

  @Delete('images/:imageId')
  async removeImage(@Param('imageId') id: string): Promise<{ ok: boolean }> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<{ ok: boolean }, IdPayload>('product.removeImage', { id })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Put(':id/images')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async replaceImages(
    @Param('id') productId: string,
    @Body()
    body: {
      images?: Array<{
        dataBase64: string;
        mimeType: string;
        originalName?: string;
      }>;
    },
  ): Promise<ProductResponseDTO> {
    const images: ImageFile[] =
      body.images?.map((f) => ({
        buffer: Buffer.from(f.dataBase64, 'base64'),
        mimeType: f.mimeType,
        originalName: f.originalName,
      })) ?? [];

    try {
      return await firstValueFrom(
        this.productClient
          .send<
            ProductResponseDTO,
            { productId: string; images: ImageFile[] }
          >('product.replaceImages', { productId, images })
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }

  @Post('increment-stocks')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async incrementStocks(
    @Body() payload: IncrementStocksPayload,
  ): Promise<StockIncrementResponse> {
    try {
      return await firstValueFrom(
        this.productClient
          .send<
            StockIncrementResponse,
            IncrementStocksPayload
          >('product.incrementStocks', payload)
          .pipe(timeout(5000)),
      );
    } catch (err) {
      throwRpcAsHttp(err);
    }
  }
}
