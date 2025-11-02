export type ImageMetadata = {
  id: string;
  productId: string;
  mimeType: string;
  originalName?: string;
  dataBase64?: string;
  createdAt: string;
};

export type ImageFileResponse = {
  id: string;
  dataBase64: string;
  mimeType: string;
};
export class SellerResponseDTO {
  id!: string;
  storeName!: string;
  description!: string;
  createdAt!: string;
  updatedAt!: string;
}

export type ProductResponseDTO = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ImageMetadata[];
  seller?: SellerResponseDTO;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export type CreateProductDTO = {
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export type UpdateProductDTO = Partial<
  Omit<CreateProductDTO, "sellerId" | "stock">
>;

export type ProductsListRequestDTO = {
  page?: number;
  pageSize?: number;
  q?: string;
};
export type ProductSellerListRequestDTO = {
  sellerId: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

export type StockIncrementItem = { productId: string; delta: number };
export type StockIncrementResponse = {
  ok: boolean;
  updated: { productId: string; newStock: number }[];
};
