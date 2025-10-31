import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BuyerOrdersListRequestDTO {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  sellerNameContains?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
