import { api } from "../lib/axios";
import type {
  AddItemBody,
  CartResponseDTO,
  CartStatsResponseDTO,
  IncrementBody,
  ReplaceItemsBody,
  SetQtyBody,
} from "../dto/cart.dto";

export const getCart = (userId: string) =>
  api.get<CartResponseDTO>(`/carts/${userId}`).then((r) => r.data);

export const initCart = (userId: string) =>
  api.post<CartResponseDTO>(`/carts/${userId}/init`, {}).then((r) => r.data);

export const addItem = (userId: string, body: AddItemBody) =>
  api.post<CartResponseDTO>(`/carts/${userId}/items`, body).then((r) => r.data);

export const setItemQty = (
  userId: string,
  productId: string,
  body: SetQtyBody
) =>
  api
    .put<CartResponseDTO>(`/carts/${userId}/items/${productId}/qty`, body)
    .then((r) => r.data);

export const incrementItem = (
  userId: string,
  productId: string,
  body: IncrementBody
) =>
  api
    .patch<CartResponseDTO>(`/carts/${userId}/items/${productId}`, body)
    .then((r) => r.data);

export const removeItem = (userId: string, productId: string) =>
  api
    .delete<CartResponseDTO>(`/carts/${userId}/items/${productId}`)
    .then((r) => r.data);

export const clearCart = (userId: string) =>
  api.delete<CartResponseDTO>(`/carts/${userId}`).then((r) => r.data);

export const replaceItems = (userId: string, body: ReplaceItemsBody) =>
  api.put<CartResponseDTO>(`/carts/${userId}/items`, body).then((r) => r.data);

export const getStats = (userId: string) =>
  api.get<CartStatsResponseDTO>(`/carts/${userId}/stats`).then((r) => r.data);
