import { IsString, IsNotEmpty } from 'class-validator';

export class GetCartDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
