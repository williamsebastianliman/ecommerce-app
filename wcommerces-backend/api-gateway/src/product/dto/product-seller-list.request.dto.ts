import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class ProductSellerListRequestDTO {
  @IsString()
  sellerId!: string;

  @IsInt()
  @Min(1)
  page?: number;

  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
