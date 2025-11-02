export class CreateProductDTO {
  sellerId!: string;
  name!: string;
  description!: string;
  stock?: number;
  price!: number;
}
