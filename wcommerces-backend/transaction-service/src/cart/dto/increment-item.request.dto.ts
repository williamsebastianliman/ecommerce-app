import { IsString, IsNotEmpty, IsInt, NotEquals } from 'class-validator';

export class IncrementItemDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @NotEquals(0)
  delta!: number;
}
