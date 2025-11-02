import { ProductImageDTO } from './image.dto';
import { SellerResponseDTO } from '../../user-client/dto/seller.response.dto';

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
