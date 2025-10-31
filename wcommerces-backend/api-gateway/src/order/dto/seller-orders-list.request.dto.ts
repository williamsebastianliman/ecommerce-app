import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SellerOrdersListRequestDTO {
  @IsString()
  sellerId!: string;

  @IsOptional()
  @IsString()
  buyerNameContains?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
