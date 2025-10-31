import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderFromCartDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
