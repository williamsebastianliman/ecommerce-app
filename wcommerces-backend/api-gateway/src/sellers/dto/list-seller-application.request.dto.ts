import { IsIn, IsInt, Min } from 'class-validator';

export class ListSellerApplicationDto {
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsInt()
  @Min(1)
  page!: number;

  @IsInt()
  @Min(1)
  pageSize!: number;
}
