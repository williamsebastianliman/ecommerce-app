import { api } from "../lib/axios";
import type {
  CreateProductDTO,
  ImageFileResponse,
  ImageMetadata,
  PaginatedResponse,
  ProductResponseDTO,
  ProductSellerListRequestDTO,
  StockIncrementItem,
  StockIncrementResponse,
  UpdateProductDTO,
} from "../dto/product.dto";

export const getProductById = (id: string) =>
  api.get<ProductResponseDTO>(`/products/${id}`).then((r) => r.data);

export function listAllProducts(params: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  return api
    .get<PaginatedResponse<ProductResponseDTO>>("/products", { params })
    .then((r) => r.data);
}

export const listProductsBySeller = (dto: ProductSellerListRequestDTO) =>
  api
    .get<PaginatedResponse<ProductResponseDTO>>("/products/seller/list", {
      params: dto,
    })
    .then((r) => r.data);

export const createProduct = (dto: CreateProductDTO, files: File[]) => {
  const form = new FormData();
  Object.entries(dto).forEach(([k, v]) => form.append(k, String(v)));
  files.forEach((f) => form.append("images", f));
  return api.post<ProductResponseDTO>("/products", form).then((r) => r.data);
};

export const updateProduct = (id: string, dto: UpdateProductDTO) =>
  api.patch<ProductResponseDTO>(`/products/${id}`, dto).then((r) => r.data);

export const removeProduct = (id: string) =>
  api.delete<{ ok: boolean }>(`/products/${id}`).then((r) => r.data);

export const listImages = (productId: string) =>
  api.get<ImageMetadata[]>(`/products/${productId}/images`).then((r) => r.data);

export const getImage = (imageId: string) =>
  api.get<ImageFileResponse>(`/products/images/${imageId}`).then((r) => r.data);

export const addImages = (productId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  return api
    .post<ImageMetadata[]>(`/products/${productId}/images`, form)
    .then((r) => r.data);
};

export const replaceImages = (
  productId: string,
  b64s: { dataBase64: string; mimeType: string; originalName?: string }[]
) =>
  api
    .put<ProductResponseDTO>(`/products/${productId}/images`, { images: b64s })
    .then((r) => r.data);

export const incrementStocks = (items: StockIncrementItem[]) =>
  api
    .post<StockIncrementResponse>("/products/increment-stocks", { items })
    .then((r) => r.data);
