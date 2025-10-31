import { ProductImageDTO } from './product-image.request.dto';

export class ProductResponseDTO {
  id!: string;
  sellerId!: string;
  name!: string;
  description!: string;
  stock!: number;
  images!: ProductImageDTO[];
  price: number;
}
