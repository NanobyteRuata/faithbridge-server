import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsArray()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string[];

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  nickName: string;

  @IsArray()
  @IsString()
  phone: string[];

  @IsArray()
  @IsString()
  @IsOptional()
  address: string[];
}
