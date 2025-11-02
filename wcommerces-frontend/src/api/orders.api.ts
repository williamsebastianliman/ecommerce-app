import { api } from "../lib/axios";
import type {
  BuyerOrdersListRequestDTO,
  CreateOrderDirectDTO,
  CreateOrderFromCartDTO,
  OrderCreatedResponseDTO,
  OrderResponseDTO,
  PaginatedOrders,
  SellerOrdersListRequestDTO,
} from "../dto/order.dto";
import type { PaginatedResponse } from "../dto/product.dto";

export const getOrderById = (id: string) =>
  api.get<OrderResponseDTO>(`/orders/${id}`).then((r) => r.data);

export const listOrdersForBuyer = (dto: BuyerOrdersListRequestDTO) =>
  api
    .get<PaginatedOrders>("/orders/buyer/list", { params: dto })
    .then((r) => r.data);

export const listOrdersForSeller = (dto: SellerOrdersListRequestDTO) =>
  api
    .get<PaginatedOrders>("/orders/seller/list", { params: dto })
    .then((r) => r.data);

export const createOrderFromCart = (dto: CreateOrderFromCartDTO) =>
  api
    .post<OrderCreatedResponseDTO>("/orders/from-cart", dto)
    .then((r) => r.data);

export const createOrderDirect = (dto: CreateOrderDirectDTO) =>
  api.post<OrderCreatedResponseDTO>("/orders/direct", dto).then((r) => r.data);

export const listBuyerOrders = (dto: BuyerOrdersListRequestDTO) =>
  api
    .get<PaginatedResponse<OrderResponseDTO>>("/orders/buyer/list", {
      params: dto,
    })
    .then((r) => r.data);
