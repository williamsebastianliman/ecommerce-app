import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ProductResponseDTO } from './dto/product.response.dto';
import { IdDTO } from './dto/id.request.dto';
import { ImageMetadata } from './dto/product-io.dto';
import { ProductIdDTO } from './dto/product-id.request.dto';

@Injectable()
export class ProductClientService {
  constructor(@Inject('PRODUCT_CLIENT') private readonly client: ClientProxy) {}

  async getById(id: string): Promise<ProductResponseDTO> {
    return await firstValueFrom(
      this.client
        .send<ProductResponseDTO, IdDTO>('product.getById', { id })
        .pipe(timeout(5000)),
    );
  }

  async listImages(productId: string) {
    return await firstValueFrom(
      this.client
        .send<
          ImageMetadata[],
          ProductIdDTO
        >('product.listImages', { productId })
        .pipe(timeout(5000)),
    );
  }
}
