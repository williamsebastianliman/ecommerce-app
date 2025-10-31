// src/cart/dto/add-item.request.dto.ts
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddItemDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
