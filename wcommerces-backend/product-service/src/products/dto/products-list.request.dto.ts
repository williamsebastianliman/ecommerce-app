import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class ProductsListRequestDTO {
  @IsInt()
  @Min(1)
  page?: number;

  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsString()
  @MaxLength(200)
  q?: string;
}
