import { api } from "../lib/axios";
import type {
  CreateSellerApplicationDto,
  ListSellerApplicationDto,
  SellerApplicationDto,
  CreateSellerProfileDto,
  SellerProfileDto,
  UpdateSellerProfileDto,
  OkDto,
} from "../dto/seller.dto";
import type { PaginatedResponse } from "../dto/product.dto";

export const createSellerApplication = (dto: CreateSellerApplicationDto) =>
  api
    .post<SellerApplicationDto>("/seller/applications", dto)
    .then((r) => r.data);

export const getSellerApplicationById = (id: string) =>
  api
    .get<SellerApplicationDto>(`/seller/applications/${id}`)
    .then((r) => r.data);

export const getLatestApplicationByUser = (id: string) =>
  api
    .get<SellerApplicationDto>(`/seller/applications/latest/${id}`)
    .then((r) => r.data);

export const listSellerApplications = (q: ListSellerApplicationDto) =>
  api
    .get<PaginatedResponse<SellerApplicationDto>>("/seller/applications", {
      params: q,
    })
    .then((r) => r.data);

export const approveSellerApplication = (id: string) =>
  api
    .post<SellerApplicationDto>(`/seller/applications/${id}/approve`)
    .then((r) => r.data);

export const rejectSellerApplication = (id: string) =>
  api
    .post<SellerApplicationDto>(`/seller/applications/${id}/reject`)
    .then((r) => r.data);

export const getSellerProfileByUserId = (id: string) =>
  api.get<SellerProfileDto>(`/seller/profile/${id}`).then((r) => r.data);

export const createSellerProfile = (dto: CreateSellerProfileDto) =>
  api.post<SellerProfileDto>("/seller/profile", dto).then((r) => r.data);

export const updateSellerProfile = (dto: UpdateSellerProfileDto) =>
  api.patch<SellerProfileDto>("/seller/profile", dto).then((r) => r.data);

export const deleteSellerProfile = (userId: string) =>
  api.delete<OkDto>(`/seller/profile/${userId}`).then((r) => r.data);
