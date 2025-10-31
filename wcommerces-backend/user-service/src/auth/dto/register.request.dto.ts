import { IsEmail, MaxLength, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ContainsDigit,
  ContainsLowercase,
  ContainsSymbol,
  ContainsUppercase,
} from '../../validation/password-rules';
export class RegisterDTO {
  @IsEmail() email!: string;

  @MinLength(8, { message: 'Password must be at least 8 characters!' })
  @Validate(ContainsLowercase)
  @Validate(ContainsUppercase)
  @Validate(ContainsDigit)
  @Validate(ContainsSymbol)
  password!: string;

  @MinLength(4, { message: 'Name must be at least 4 characters!' })
  @MaxLength(30, { message: 'Name cannot be more than 30 characters!' })
  @Transform(({ value }): string => {
    return String(value).trim();
  })
  name!: string;

  @MinLength(5, { message: 'Address must be at least 5 characters!' })
  @MaxLength(100, { message: 'Address cannot be more than 100 characters!' })
  @Transform(({ value }): string => {
    return String(value).trim();
  })
  address!: string;
}
