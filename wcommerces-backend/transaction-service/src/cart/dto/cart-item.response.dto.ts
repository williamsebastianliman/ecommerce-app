import { ProductInCartResponseDTO } from './product-in-cart.response.dto';

export class CartItemResponseDTO {
  id!: string;
  productId!: string;
  quantity!: number;
  createdAt!: Date;
  product!: ProductInCartResponseDTO;
}
