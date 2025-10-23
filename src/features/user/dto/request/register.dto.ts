import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsNumber()
  @IsNotEmpty()
  profileId: number;
}
