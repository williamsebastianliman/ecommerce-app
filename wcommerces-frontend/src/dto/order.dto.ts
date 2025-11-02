export type OrderDetail = {
  id: string;
  productId: string;
  sellerId: string;
  qty: number;
  priceSnapshot: number;
  createdAt: string;
};
export type OrderResponseDTO = {
  id: string;
  userId: string;
  createdAt: string;
  orderDetails: OrderDetailResponseDTO[];
};
export type OrderDetailResponseDTO = {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  qty: number;
  priceSnapshot: number;
  createdAt: string;
  product: ProductInOrderResponseDTO;
};
export type ProductInOrderResponseDTO = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type ImageMetaDTO = { id: string; mimeType: string; baseData: string };

export type PaginatedOrders = {
  items: OrderResponseDTO[];
  page: number;
  limit: number;
  total: number;
};

export type GetOrderDTO = { id: string };
export type BuyerOrdersListRequestDTO = {
  userId: string;
  sellerNameContains?: string;
  page?: number;
  pageSize?: number;
};

export type SellerOrdersListRequestDTO = {
  sellerId: string;
  page?: number;
  limit?: number;
};
export type CreateOrderFromCartDTO = { userId: string };
export type CreateOrderDirectDTO = {
  userId: string;
  productId: string;
  qty: number;
};
export type OrderCreatedResponseDTO = { id: string; ok: boolean };
