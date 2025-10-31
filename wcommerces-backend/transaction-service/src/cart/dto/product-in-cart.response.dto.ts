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
