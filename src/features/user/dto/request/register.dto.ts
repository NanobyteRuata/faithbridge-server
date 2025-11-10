import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
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
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
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
