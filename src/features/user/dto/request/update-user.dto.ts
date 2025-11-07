import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsNumber()
  @IsOptional()
  profileId?: number;
}