import { IsString } from 'class-validator';

export class OkDto {
  @IsString()
  ok: boolean;
}
