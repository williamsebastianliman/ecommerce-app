export class ProductImageMetaDTO {
  id!: string;
  mimeType!: string;
  baseData: string;
}

export class ProductInCartResponseDTO {
  id!: string;
  name!: string;
  description!: string;
  price: number;
  image?: ProductImageMetaDTO;
}
