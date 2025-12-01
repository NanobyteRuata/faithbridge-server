import { IsString, MinLength, MaxLength, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  organizationCode?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
