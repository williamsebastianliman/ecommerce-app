export type ProductImageMetaDTO = {
  id: string;
  mimeType: string;
  baseData: string;
};

export type ProductInCartResponseDTO = {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: ProductImageMetaDTO;
};

export type CartItemResponseDTO = {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string | Date;
  product: ProductInCartResponseDTO;
};

export type CartResponseDTO = {
  id: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: CartItemResponseDTO[];
};

export type CartStatsResponseDTO = {
  totalItems: number;
  grandTotal: number;
};

export type AddItemBody = {
  productId: string;
  quantity: number;
};

export type SetQtyBody = {
  quantity: number;
};

export type IncrementBody = {
  delta: number;
};

export type ReplaceItemsBody = {
  items: Array<{ productId: string; quantity: number }>;
};
