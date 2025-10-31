import { IsString } from 'class-validator';

export class ProductIdDTO {
  @IsString()
  productId: string;
}
