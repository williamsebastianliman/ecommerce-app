import type { Buffer as NodeBuffer } from 'node:buffer';

export interface ImageFile {
  buffer: NodeBuffer;
  originalName?: string;
  mimeType: string;
}

export interface ImageFileResponse {
  buffer: NodeBuffer;
  mimeType: string;
  fileName: string;
}

export interface ImageMetadata {
  id: string;
  productId: string;
  fileName: string;
  mimeType: string;
  url: string;
  createdAt: string;
}

export class ProductImageDTO {
  id!: string;
  productId!: string;
  mimeType!: string;
  createdAt!: string;
  dataBase64!: string;
}
