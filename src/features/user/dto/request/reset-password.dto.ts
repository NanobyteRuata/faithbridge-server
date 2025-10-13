import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
