import { CartItemResponseDTO } from './cart-item.response.dto';

export class CartResponseDTO {
  id!: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  items!: CartItemResponseDTO[];
}
