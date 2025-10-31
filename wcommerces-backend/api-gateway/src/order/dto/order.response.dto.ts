import { OrderDetailResponseDTO } from './order-detail.response.dto';

export class OrderResponseDTO {
  id!: string;
  userId!: string;
  createdAt!: Date;
  orderDetails!: OrderDetailResponseDTO[];
}
