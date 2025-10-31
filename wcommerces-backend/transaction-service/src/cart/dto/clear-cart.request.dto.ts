import { IsString, IsNotEmpty } from 'class-validator';

export class ClearCartDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
