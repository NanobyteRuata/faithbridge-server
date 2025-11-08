import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsOptional()
  organizationCode?: string;

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
