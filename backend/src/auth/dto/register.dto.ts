import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  securityQuestion1: string;

  @IsString()
  securityAnswer1: string;

  @IsString()
  securityQuestion2: string;

  @IsString()
  securityAnswer2: string;

  @IsString()
  securityQuestion3: string;

  @IsString()
  securityAnswer3: string;
}
