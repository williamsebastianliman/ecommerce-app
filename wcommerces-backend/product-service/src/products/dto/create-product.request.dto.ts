import {
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDTO {
  @IsUUID('4', { message: 'sellerId must be a valid UUID' })
  sellerId!: string;

  @IsString({ message: 'name must be a string' })
  @MinLength(4, { message: 'name must be at least 4 characters' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsString({ message: 'description must be a string' })
  @MinLength(5, { message: 'description must be at least 5 characters' })
  @MaxLength(200, { message: 'description must be at most 200 characters' })
  description!: string;

  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'stock must be an integer' })
  @Min(0, { message: 'stock must be ≥ 0' })
  stock!: number;

  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'price must be an integer' })
  @Min(0, { message: 'price must be ≥ 0' })
  price!: number;
}
