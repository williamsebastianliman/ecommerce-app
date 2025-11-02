import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
