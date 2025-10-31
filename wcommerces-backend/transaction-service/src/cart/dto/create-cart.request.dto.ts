import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCartDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
