import { MinLength, MaxLength, IsString } from 'class-validator';

export class CreateSellerApplicationDto {
  @IsString()
  userId!: string;

  @MinLength(4)
  @MaxLength(40)
  storeName!: string;

  @MinLength(10)
  @MaxLength(200)
  description?: string;
}
