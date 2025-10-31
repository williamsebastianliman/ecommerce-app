import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
export class CreateProductDTO {
  @IsString() sellerId!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  description!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsInt()
  @Min(0)
  price!: number;
}
