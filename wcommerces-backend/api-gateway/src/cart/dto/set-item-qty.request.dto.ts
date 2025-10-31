import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class SetItemQtyDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(0)
  quantity!: number;
}
