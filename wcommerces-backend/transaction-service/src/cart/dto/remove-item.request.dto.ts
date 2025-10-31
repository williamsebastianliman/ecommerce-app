import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveItemDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;
}
