export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export type SellerApplicationDto = {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
};

export type ListSellerApplicationDto = {
  page: number;
  pageSize: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export type CreateSellerApplicationDto = {
  userId: string;
  storeName: string;
  description?: string;
};

export type SellerProfileDto = {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSellerProfileDto = {
  userId: string;
  storeName: string;
  description?: string;
};

export type UpdateSellerProfileDto = {
  userId: string;
  storeName?: string;
  description?: string;
};

export type OkDto = { ok: boolean };
