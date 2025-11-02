import { ProductImageDTO } from './product-image.request.dto';
import { SellerResponseDTO } from './seller-response.dto';

export class ProductResponseDTO {
  id!: string;
  sellerId!: string;
  name!: string;
  description!: string;
  stock!: number;
  price!: number;
  images!: ProductImageDTO[];
  seller?: SellerResponseDTO;
}
