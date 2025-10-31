// src/cart/dto/product-in-cart.response.dto.ts
export class ProductImageMetaDTO {
  id!: string;
  mimeType!: string;
}

export class ProductInCartResponseDTO {
  id!: string;
  name!: string;
  description!: string;
  image?: ProductImageMetaDTO;
}
