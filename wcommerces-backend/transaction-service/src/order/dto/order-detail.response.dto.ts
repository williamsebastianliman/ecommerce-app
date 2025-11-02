import { ProductInOrderResponseDTO } from './product-in-order.response.dto';

export class OrderDetailResponseDTO {
  id!: string;
  orderId!: string;
  productId!: string;
  sellerId!: string;
  qty!: number;
  priceSnapshot!: number;
  createdAt!: Date;
  product: ProductInOrderResponseDTO;
}
