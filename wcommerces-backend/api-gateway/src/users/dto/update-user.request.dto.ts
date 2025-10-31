import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  id!: string;

  @MinLength(4, { message: 'Name must be at least 4 characters!' })
  @MaxLength(30, { message: 'Name cannot be more than 30 characters!' })
  name!: string;

  @MinLength(5, { message: 'Address must be at least 5 characters!' })
  @MaxLength(100, { message: 'Address cannot be more than 100 characters!' })
  address!: string;
}
