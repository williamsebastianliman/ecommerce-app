import { IsString, MinLength } from 'class-validator';

export class RemoveProductFromAllDTO {
  @IsString()
  @MinLength(1)
  productId!: string;
}
