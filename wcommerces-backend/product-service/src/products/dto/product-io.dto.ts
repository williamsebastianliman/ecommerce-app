import type { Buffer as NodeBuffer } from 'node:buffer';

export interface ImageFile {
  buffer: NodeBuffer;
  mimeType: string;
  originalName?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  stock?: number;
  price?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ImageMetadata {
  id: string;
  productId: string;
  fileName: string;
  mimeType: string;
  url: string;
  createdAt: string;
}

export interface ImageFileResponse {
  buffer: NodeBuffer;
  mimeType: string;
  fileName: string;
}

export interface StockIncrementItem {
  productId: string;
  delta: number;
}

export interface StockIncrementResponse {
  updated: Array<{ id: string; stock: number }>;
  count: number;
}

// Using Prisma's built-in types for Product with images instead of custom type
