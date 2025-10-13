import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

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
