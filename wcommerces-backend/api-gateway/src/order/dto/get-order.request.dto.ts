import { IsNotEmpty, IsString } from 'class-validator';

export class GetOrderDTO {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
