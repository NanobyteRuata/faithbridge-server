import { Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { CreateProfileDto } from 'src/features/profile/dto/request/create-profile.dto';

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

  @ValidateNested()
  @Type(() => CreateProfileDto)
  @IsNotEmpty()
  profile: CreateProfileDto;
}
